/*
 * jangular
 * http://jangular.com
 *
 * Copyright (c) 2014 GetHuman LLC
 * Licensed under the MIT license.
 */

var Jeff = require('jeff-core'),
    savedFilters = {}, ngRepeat = null,
    patternPrefix = /^(x\-|data\-)/g, patternDelimit = /[_:]/g, patternPluralize = /\{\}/g,
    patternRepeatStmt = /^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?\s*$/;

Jeff.JNG_STRIP_DIRECTIVES = '__jng_strip_directives__';

function dashToCamelCase(str) {
    return str.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
}
function setAttribute(attr) {
    return function(scope, element, attrs, val) {
        element.attr(attr, val);
    };
}
function setAttributeBool(attr) {
    return function(scope, element, attrs, val) {
        if ( val ) {
            //e.attributes[attr] = null;
            element.attr(attr, null);
        } else {
            //delete e.attributes[attr];
            element.removeAttr(attr);
        }
    };
}
function addClassBool(clazz, invert) {
    return function(scope, element, attrs, val) {
        if ( (invert && !val) || (val && !invert) ) {
            element.addClasses(clazz);
        } else {
            element.removeClasses(clazz);
        }
    };
}
/*
    angularTransform directives should have the signature function(scope, elem, attrs, val) - just like angular linking fn;
    that way, we can use same directive syntax as angular client side, but on server side

        return function (scope, element, attrs, val) {  // the val part is not part of angular
            attrs.$observe('ghTitle', function(value) {
                if (value) {
                    attrs.$set('title', i18n.translate(value));
                }
            });
        };

 */

var angularTransforms = {
    'ng-bind': function(scope, element, attrs, val) {
        element.empty();
        element.text((typeof(val) !== 'undefined' && val !== null && val.toString ? val.toString() : ''));
    },
    'ng-model': function(scope, element, attrs, val) {
        if (element.tag === 'input' && typeof(val) !== 'undefined' && val !== null && val.toString) {
            element.attr('value', val.toString());
        } else if (element.tag === 'textarea' && typeof(val) !== 'undefined' && val !== null && val.toString) {
            element.empty();
            element.text(val.toString());
        }
    },
    'ng-checked': setAttributeBool('checked'),
    'ng-class': function(scope, element, attrs, val) {
        var removes = [];
        var adds = [];
        if ( Jeff.Utils.isObject(val) ) {
            for (var prop in val) {
                if (val[prop]) {
                    adds.push(prop);
                } else {
                    removes.push(prop);
                }
            }
        } else {
            adds = val;
        }
        element.removeClasses(removes);
        element.addClasses(adds);
    },
    'ng-disabled': setAttributeBool('disabled'),
    'ng-hide': addClassBool('ng-hide'),
    'ng-href': setAttribute('href'),
    'ng-if': function(scope, element, attrs, val) {
        if ( !val ) {
            element.remove();
        }
    },
    'ng-include': function(scope, element, attrs, val) {
        element.text(Jeff.template(val)(scope));
    },
    'ng-open': setAttributeBool('open'),
    'ng-readonly': setAttributeBool('readonly'),
    'ng-selected': setAttributeBool('selected'),
    'ng-show': addClassBool('ng-hide', true),
    'ng-src': setAttribute('src'),
    'ng-srcset': setAttribute('srcset'),
    'ng-style': function(scope, element, attrs, val) {
        element.css(val);
    },
    'ng-pluralize': function(scope, element, attrs) {
        // if no count or when, then return e without doing anything
        if (!attrs || !attrs.hasOwnProperty('count') || !attrs.hasOwnProperty('when')) {
            return;
        }

        //TODO: this will ONLY work if the value of count is a model variable; if not, will throw error
        // ok for now since not used that often and will almost always have a model value
        var when = null, count = 0, counted = 0; // count is the actual count, counted is count minus offset
        eval('when = ' + attrs.when + ';');
        eval('count = scope.' + attrs.count + ';');
        counted = count;

        // return if no when
        if (!when) { return; }

        // offset counted if it exists
        if (attrs.offset) {
            eval('counted -= ' + attrs.offset + ';');
        }

        var result = '';
        if (when[count + '']) {
            result = when[count + ''];
        }
        else if (count === 1 && when['one']) {
            result = when['one'];
        }
        else if (when['other']) {
            result = when['other'];
        }
        result = result.replace(patternPluralize, counted.toString());
        element.empty();
        element.text(result);
    }
};
angularTransforms['ng-bind-html'] = angularTransforms['ng-bind'];

function getDirectiveAttrs(e, directiveName, val) {
    var attrs = Jeff.Utils.extend({}, e.attributes);
    attrs[dashToCamelCase(directiveName)] = val;
    attrs.$observe = function(attrName, fn) {
        fn(attrs[attrName]);
    };
    attrs.$set = function(name, val) {
        e.attributes[name] = val;
    };
    return attrs;
}

function getDirectiveElement(e) {
    var element = {};
    element.tag = e.tag;
    element.text = function(str) {
        e.text = str;
    };
    element.remove = function() {
        e.tag = e.text = e.children = e.attributes = null;
    };
    element.css = function(val) {
        if ( Jeff.Utils.isObject(val) ) {
            var styles = e.attributes['style'] ? e.attributes['style'].split(';') : [];
            for ( var prop in val ) {
                styles.push(prop + ':' + val[prop]);
            }
            e.attributes['style'] = styles.join(';');
        }
    };
    element.attr = function(name, val) {
        if ( val || val === null ) {
            e.attributes = e.attributes || {};
            e.attributes[name] = val;
        }
        return e.attributes[name];
    };
    element.removeAttr = function(name) {
        delete e.attributes[name];
    };
    element.addClasses = function(clazz) {
        var newClasses = (clazz ? (Jeff.Utils.isArray(clazz) ? clazz : clazz.split(' ')) : []);
        if ( newClasses.length < 1 ) {
            return;
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
    };
    element.removeClasses = function(clazz) {
        if ( !e.attributes['class']) {
            return;
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
    };
    element.empty = function() {
        e.children = null;
        e.text = null;
    };
    return element;
}

var jngFnStart = "__jng_fn_start__";
var jngFnEnd = "__jng_fn_end__";
var jngFnRegex = /(\"__jng_fn_start__|__jng_fn_end__\")/g;

function stringifyIncludeFunctions(savedFunctions, key, value) {
    if ( typeof value === 'function' ) {
        var fnkey = 'fn' + Object.keys(savedFunctions).length;
        savedFunctions[fnkey] = value;
        return jngFnStart + "jngSavedFunctions['" + fnkey + "']" + jngFnEnd;
    } else if ( typeof  value === 'undefined' || value === null ) {
        return '';
    }
    return value;
}

function angularize(e, currentModel) { // e is an already-built Jeff element w attributes, children, and text - and a tagName...

    if ( !e ) {
        return e;
    }

    // spill out model into current scope, try to do so only once
    var foreval = ';', buildVars = [], jngSavedFunctions = {}, jngFunctionReplacer = function(key, value) {
        return stringifyIncludeFunctions(jngSavedFunctions, key, value);
    };

    for ( var prop in currentModel ) {
        buildVars.push(prop + ' = ' + JSON.stringify(currentModel[prop], jngFunctionReplacer).replace(jngFnRegex, ''));
    }
    if ( buildVars.length > 0 ) {
        foreval = 'var ' + buildVars.join(', ') + ';';
    }

    try {
        eval(foreval);
    }
    catch (err) {
        console.log('\n\nError evaling:\n' + foreval + ';\n\nwith element:\n' + JSON.stringify(e) + '\n\n');
        throw err;
    }

    function angularizeNode(e) { // we don't need to spill model each time, hence inner function

        var attr = null, i = 0, len = 0, attrs = (e ? e.attributes : null), needsStripping = false;

        if ( e == null ) {
            return e;
        }
        if (Jeff.Utils.isArray(e)) {
            for (i = 0; i < e.length; i++) {
                angularizeNode(e[i]);
            }
            return e;
        }
        if (attrs && !e.ngRepeat && (attrs['ng-repeat'] || attrs['data-ng-repeat'] || attrs['jng-repeat'] || attrs['data-jng-repeat'])) {
            e.ngRepeat = attrs['ng-repeat'] || attrs['jng-repeat'] || attrs['data-ng-repeat'] || attrs['data-jng-repeat'];
        }
        else if (attrs) { // find each angular directive and transform

            for( attr in attrs ) {
                var attrNormal = attr.replace(patternPrefix,'').replace(patternDelimit, '-');
                if ( attr === 'ui-view' || attr === 'jng-strip' ) {
                    needsStripping = true;
                    continue;
                }
                if ( angularTransforms[attrNormal] ) {
                    var evaled = null;
                    var filters = (attrs[attr] ? attrs[attr].split(' | ') : []);
                    var attrValue = filters.shift();
                    var preval = 'evaled = ' + attrValue + ';';

                    try {
                        eval(preval);
                    } catch (ex) {
                        // just always do this - because we don't always put a var from scope here - could be a string
                        evaled = null;
                    }

                    if ( filters.length ) {
                        while ( filters.length ) {
                            var filterChunk = filters.shift().trim();
                            var chunks = filterChunk.split(':'); // in case there are inputs
                            var filter = chunks.shift();
                            for( i = 0, len = chunks.length; i < len; ++i ) { // couldn't get this to work with map()
                                eval('chunks[i] = ' + chunks[i] + ';');
                            }
                            chunks.unshift(evaled);
                            var filterSource = (currentModel[filter] ? currentModel : savedFilters);
                            evaled = filterSource[filter].apply(this, chunks);
                        }
                    }
                    // getDirectiveElement and getDirectiveAttrs wraps e/attrs, allows methods $observe, $set, etc
                    angularTransforms[attrNormal](currentModel, getDirectiveElement(e),
                        getDirectiveAttrs(e, attrNormal, evaled), evaled);
                }
                if (!e.attributes) { // can happen, in, say, ng-if
                    break;
                } else if ( currentModel[Jeff.JNG_STRIP_DIRECTIVES] === true && e.attributes.hasOwnProperty(attr) &&
                        (attr.indexOf('ng-') === 0 || angularTransforms.hasOwnProperty(attr))  ) {
                    delete(e.attributes[attr]);
                }

            }
            if (e.ngRepeat) { // removes previously appended attribute if it's there
                delete e.ngRepeat;
            }
        }

        if (e.ngRepeat) { // ng-repeat gets pretty special treatment and re-scoping (see use of outer function)...
            e = ngRepeat(e, currentModel);
        }
        else if (e.children) {
            if ( needsStripping ) {
                currentModel[Jeff.JNG_STRIP_DIRECTIVES] = true;
            }
            for( i = 0, len = e.children.length; i < len; i++ ) {
                e.children[i] = angularizeNode(e.children[i]);
            }
            if ( needsStripping ) {
                currentModel[Jeff.JNG_STRIP_DIRECTIVES] = false;
            }
        }
        return e;
    }

    return angularizeNode(e);
}

ngRepeat = function(e, model) {
    var repeatStatement = e.ngRepeat.match(patternRepeatStmt);
    var reps = [];
    var repeatVar = repeatStatement[1];
    var repeatArr = null;
    try{
        eval('repeatArr = model.' + repeatStatement[2] + ';');
    }
    catch (err) {
        console.log('\n\nError evaling:\nrepeatArr = model.' + repeatStatement[2] + ';\n\nwith element:\n' + JSON.stringify(e) + '\n\n');
        throw err;
    }
    if (repeatArr) {
        for ( var i = 0, len = repeatArr.length; i < len; i++ ) {
            var repModel = Jeff.Utils.extend({}, model, {'$index': i, '$even': (i % 2 === 0), '$odd': (i % 2 === 1), '$first': (i === 0), '$last': (i === len-1), '$middle': (i > 0 && i < (len-1))});
            repModel[repeatVar] = repeatArr[i];
            reps.push(angularize(Jeff.Utils.extend(true, {}, e), repModel)); // without toString, overwrites variables?
        }
    }
    return Jeff.naked(reps); // correctly wraps raw array
};

Jeff.templateToString = function(result, model) {
    return (Jeff.Utils.isString(result) ? result : (Jeff.Utils.isArray(result) ? angularize(Jeff.naked(result), model).toString() : angularize(result, model).toString()));
};

function runFiltersOnInput(input, filters) {
    filters = filters ? (Jeff.Utils.isArray(filters) ? filters : filters.split(',')) : [];
    while( filters.length ) {
        var filter = filters.shift();
        if ( Jeff.Utils.isFunction(filter) ) {
            input = filter(input);
        } else {
            input = savedFilters[filter](input);
        }
    }
    return input;
}

var makeDirective = {
    'replace': function(name, opts) {
        var directivePath = Jeff.Utils.isObject(opts) ? opts.path : opts;
        return function(scope, element, attrs) {
            var newModel = Jeff.Utils.extend(true, scope, {_directiveName: name});
            delete newModel[name]; // because otherwise we'll eval a variable like 'gh-directive', which is not valid
            var directive = Jeff.getTemplate(directivePath);
            var rendered = directive(newModel, element, attrs);
            var newElement = angularize(rendered, newModel); // since we're replacing...
            newElement.attributes = newElement.attributes || {};
            if ( scope[Jeff.JNG_STRIP_DIRECTIVES] !== true ) {
                newElement.attributes[name] = null;
            }
            // we do the following because it's a replace; toString() is called now so variables are still in scope
            element.remove(); // sets text, children, attributes, and tag to null
            element.text(newElement.toString());
        };
    },
    'transform': function(name, directive) {
        return directive.transform;
    },
    'bindAndFilter': function(name, opts) {
        var transform = angularTransforms['ng-bind'];
        return function(scope, element, attrs, val) {
            return transform(scope, element, attrs, runFiltersOnInput(val, opts.filters));
        };
    },
    'attributeAndFilter': function(name, opts) {
        var transform = setAttribute(opts.attribute);
        return function(scope, element, attrs, val) {
            return transform(scope, element, attrs, runFiltersOnInput(val, opts.filters));
        };
    }
};

Jeff.angularize = angularize;

/*
Jeff.setEvalAttributes = function(evalAttrs) {
    evalAttributes = evalAttrs;
    updateEvalAttributes();
};

Jeff.addEvalAttribute = function(attr) {
    if ( evalAttributes.indexOf(attr) < 0 ) {
        evalAttributes.push(attr);
        updateEvalAttributes();
    }
};
*/

Jeff.addDirectives = function(directives) {
    for ( var directiveName in directives) {
        if ( !angularTransforms[directiveName] ) {
            var directive = directives[directiveName];
            var type = directive.type || 'replace';
            angularTransforms[directiveName] = makeDirective[type](directiveName, directive);
        }
    }
};

Jeff.addFilters = function(moreFilters) {
    Jeff.Utils.extend(savedFilters, moreFilters);
};

module.exports = Jeff;
