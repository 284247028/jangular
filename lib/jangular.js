/*
 * jangular
 * http://jangular.com
 *
 * Copyright (c) 2014 GetHuman LLC
 * Licensed under the MIT license.
 */

var Jeff = require('jeff-core'),
    addClasses = null, removeClasses = null, ngRepeat = null, patternPrefix = /^(x\-|data\-)/g, patternDelimit = /[_:]/g;

function setAttribute(attr) {
    return function(e, val) {
        e.attributes[attr] = val;
        return e;
    };
}
function setAttributeBool(attr) {
    return function(e, val) {
        if ( val ) {
            e.attributes[attr] = null;
        } else {
            delete e.attributes[attr];
        }
        return e;
    };
}
function addClassBool(clazz) {
    return function(e, val) {
        return (val ? addClasses(e, clazz) : e);
    };
}

var angularTransforms = {
    'ng-bind': function(e, val) {
        e.text = val.toString(); // in case it thinks its not a string (like if value is zero)
        e.children = null;
        return e;
    },
    'ng-checked': setAttributeBool('checked'),
    'ng-class': function(e, val) {
        var removes = [];
        if ( Jeff.Utils.isObject(val) ) {
            var adds = [];
            for (var prop in val) {
                if (val[prop]) {
                    adds.push(prop);
                } else {
                    removes.push(prop);
                }
            }
            val = adds;
        }
        return addClasses(removeClasses(e, removes), val);
    },
    'ng-disabled': setAttributeBool('disabled'),
    'ng-hide': addClassBool('ng-hide'),
    'ng-href': setAttribute('href'),
    'ng-include': function(e, val, model) {
        var included = Jeff.template(val)(model);
        e.text = included;
        return e;
    },
    'ng-open': setAttributeBool('open'),
    'ng-readonly': setAttributeBool('readonly'),
    'ng-selected': setAttributeBool('selected'),
    'ng-show': addClassBool('ng-show'),
    'ng-src': setAttribute('src'),
    'ng-srcset': setAttribute('srcset'),
    'ng-style': function(e, val) {
        if ( Jeff.Utils.isObject(val) ) {
            var styles = e.attributes['style'] ? e.attributes['style'].split(';') : [];
            for ( var prop in val ) {
                styles.push(prop + ':' + val[prop]);
            }
            e.attributes['style'] = styles.join(';');
            return e;
        } else {
            return e;
        }
    }
};
angularTransforms['ng-bind-html'] = angularTransforms['ng-bind'];
angularTransforms['ng-model'] = angularTransforms['ng-bind'];

addClasses = function(e, clazz) {
    var newClasses = (clazz ? (Jeff.Utils.isArray(clazz) ? clazz : clazz.split(' ')) : []);
    if ( newClasses.length < 1 ) {
        return e;
    }
    if ( !e.attributes['class'] ) {
        e.attributes['class'] = Jeff.Utils.isArray(clazz) ? clazz.join(' ') : clazz;
    } else {
        var classes = e.attributes['class'].split(' ');
        var i = newClasses.length;
        while( i-- ) {
            var newClass = newClasses[i];
            if ( classes.indexOf(newClass) < 0 ) {
                classes.push(newClass);
            }
        }
        e.attributes['class'] = classes.join(' ');
    }
    return e;
};

removeClasses = function(e, clazz) {
    if ( !e.attributes['class']) {
        return e;
    }
    clazz = (Jeff.Utils.isArray(clazz) ? clazz : clazz.split(' '));
    var classes = e.attributes['class'].split(' ');
    var i = clazz.length;
    while ( i-- ) {
        var classIdx = classes.indexOf(clazz[i]);
        if ( classIdx > -1 ) {
            classes.splice(classIdx, 1);
        }
    }
    if ( classes.length > 0 ) {
        e.attributes['class'] = classes.join(' ');
    } else {
        delete e.attributes.class;
    }
    return e;
};

function angularize(e, currentModel) { // e is an already-built Jeff element w attributes, children, and text - and a tagName...
    if ( !e ) {
        return e;
    }

    // spill out model into current scope, so we only have to do it once
    var foreval = ';', buildVars = [];
    for ( var prop in currentModel ) {
        buildVars.push(prop + ' = ' + JSON.stringify(currentModel[prop]));
    }
    if ( buildVars.length > 0 ) {
        foreval = 'var ' + buildVars.join(', ') + ';';
    }
    eval(foreval);

    function angularizeNode(e) { // we don't need to spill model each time, hence inner function
        var attr = null, i = 0, len = 0;
        if (e.attributes && !e.ngRepeat && (e.attributes['ng-repeat'] || e.attributes['data-ng-repeat'])) {
            e.ngRepeat = (e.attributes['data-ng-repeat'] ? e.attributes['data-ng-repeat'] : e.attributes['ng-repeat']);
        } else if (e.attributes) {
            // find each angular directive and transform

            for( attr in e.attributes ) {
                var attrNormal = attr.replace(patternPrefix,'').replace(patternDelimit, '-');
                if ( angularTransforms[attrNormal] ) {
                    var evaled = null;
                    var filters = (e.attributes[attr] ? e.attributes[attr].split('|') : []);
                    var preval = 'evaled = ' + filters.shift() + ';';
                    eval(preval); // the split because we can't handle angular filters yet
                    if ( filters.length ) {
                        while ( filters.length ) {
                            var filterChunk = filters.shift().trim();
                            var chunks = filterChunk.split(':'); // in case there are inputs
                            var filter = chunks.shift();
                            for( i = 0, len = chunks.length; i < len; ++i ) { // couldn't get this to work with map()
                                eval('chunks[i] = ' + chunks[i] + ';');
                            }
                            chunks.unshift(evaled);
                            evaled = currentModel[filter].apply(this, chunks);
                        }

                    }
                    e = angularTransforms[attrNormal](e, evaled, currentModel);
                }
            }
            if (e.ngRepeat) { // removes previously appended attribute if it's there
                delete e.ngRepeat;
            }
        }
        if (e.ngRepeat) { // ng-repeat gets pretty special treatment and re-scoping (see use of outer function)...
            e = ngRepeat(e, currentModel);
        } else if (e.children) {
            for( i = 0, len = e.children.length; i < len; i++ ) {
                e.children[i] = angularizeNode(e.children[i]);
            }
        }
        return e;
    }

    return angularizeNode(e);
}

ngRepeat = function(e, model) {
    var repeats = e.ngRepeat.split('|')[0].split(' track by ')[0].split(' in '), reps = [];
    var repeatVar = repeats[0].trim();
    var repeatArr = null;
    eval('repeatArr = model.' + repeats[1].trim() + ';');
    for ( var i = 0, len = repeatArr.length; i < len; i++ ) {
        var repModel = Jeff.Utils.extend({}, model, {'$index': i, '$even': (i % 2 === 0), '$odd': (i % 2 === 1), '$first': (i === 0), '$last': (i === len-1), '$middle': (i > 0 && i < (len-1))});
        repModel[repeatVar] = repeatArr[i];
        reps.push(angularize(Jeff.Utils.extend(true, {}, e), repModel)); // without toString, overwrites variables?
    }
    return Jeff.naked(reps); // correctly wraps raw array
};

Jeff.templateToString = function(template) {
    return function(model) {
        var result = template(model);
        return (Jeff.Utils.isString(result) ? result : (Jeff.Utils.isArray(result) ? angularize(Jeff.naked(result), model).toString() : angularize(result, model).toString()));
    };
};

function makeTransformFromDirective(directiveName, directivePath) {
    return function(e, val, model) {
        for( var attr in e.attributes ) {
            var attrVal = e.attributes[attr];
            if ( model[attrVal] ) {
                e.attributes[attr] = model[attrVal];
            }
        }
        var newModel = Jeff.Utils.extend(true, model, e.attributes);
        newModel['_directiveName'] = directiveName;
        delete newModel[directiveName]; // because otherwise we'll eval a variable like 'gh-directive', which is not valid
        e = angularize(Jeff.getTemplate(directivePath)(newModel), newModel); // since we're replacing...
        if ( !e.attributes ) {
            e.attributes = {};
        }
        e.attributes[directiveName] = null;
        return e.toString(); // if we don't evaluate now, not all vars will be in scope
    };
}

Jeff.angularize = angularize;

Jeff.addDirectives = function(directives) {
    for ( var directive in directives) {
        if ( !angularTransforms[directive] ) {
            angularTransforms[directive] = makeTransformFromDirective(directive, directives[directive]);
        }
    }
};

module.exports = Jeff;
