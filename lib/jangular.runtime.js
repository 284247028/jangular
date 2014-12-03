/**
 * Author: Jeff Whelpley
 * Date: 10/27/14
 *
 * This is used to render a jangular element
 */
var jyt             = require('jyt');
var jytToJng        = require('./jangular.jytToJng');
var utils           = require('./jangular.utils');
var savedFilters    = require('./jangular.filters').savedFilters;

var patternRepeatStmt = /^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?\s*$/;
var JNG_STRIP_DIRECTIVES = '__jng_strip_directives__';
var transforms = {};
var ngRepeat = null;

/**
 * Convert angular syntax to a jyt object template
 *
 * @param e Already-built Jeff element w attributes, children, and text - and a tagName
 * @param model
 * @returns {*} A jyt template
 */
function angularize(e, model) {
    var foreval = ';';
    var buildVars = [];
    var jngSavedFunctions = {};
    var prop;

    // don't do anything if no element passed in
    if (!e) { return e; }

    // eval all properties on the model so they are in the closure scope
    for (prop in model) {
        if (model.hasOwnProperty(prop)) {
            buildVars.push(prop + ' = ' + utils.stringify(model[prop], jngSavedFunctions));
        }
    }

    // if there are any build vars, eval them
    if (buildVars.length > 0) {
        foreval = 'var ' + buildVars.join(', ') + ';';

        try {
            /* jshint evil:true */
            eval(foreval);
        }
        catch (err) {
            console.log('\n\nError evaling:\n' + foreval + ';\n\nwith element:\n' + JSON.stringify(e) + '\n\n');
            throw err;
        }
    }

    // this inner function will have access to all the evaled data above
    // it will recursively go down the DOM tree making sure everything has been angularized
    function angularizeNode(e) {

        // if e doesn't exist, return here
        if (!e) { return e; }

        var attr = null;
        var i = 0;
        var len = 0;
        var attrs = e ? e.attributes : null;
        var ngRepeatVal = attrs && (attrs['ng-repeat'] || attrs['data-ng-repeat'] ||
                                    attrs['jng-repeat'] || attrs['data-jng-repeat']);
        var isNgRepeatVal = !e.ngRepeat && ngRepeatVal;
        var needsStripping = false;
        var attrNormal, evaled, filters, attrValue, preval, filterChunk, chunks, filter;
        var transScope, transElement, transAttrs;

        // if e is an array, we need to recurse with each item in the array
        if (jyt.utils.isArray(e)) {
            for (i = 0; i < e.length; i++) {
                angularizeNode(e[i]);
            }

            return e;
        }

        if (isNgRepeatVal) {
            e.ngRepeat = ngRepeatVal;
        }
        // find each angular directive and transform
        else if (attrs) {
            for (attr in attrs) {
                if (!attrs.hasOwnProperty(attr)) { continue; }

                // remove unnecessary attribute name values like data-, x-, etc.
                attrNormal = utils.normalize(attr);

                // anything under ui-view or jng-strip will have angular values stripped
                if (attr === 'ui-view' || attr === 'jng-strip') {
                    needsStripping = true;
                    continue;
                }

                if (transforms[attrNormal]) {
                    evaled = null;
                    filters = (attrs[attr] ? attrs[attr].split(' | ') : []);
                    attrValue = filters.shift();

                    // this will remove one time bindings (if only one value being evaled)
                    // note this won't work with a complex expression
                    if (attrValue && attrValue.substring(0, 2) === '::') {
                        attrValue = attrValue.substring(2);
                    }

                    preval = 'evaled = ' + attrValue + ';';

                    try {
                        eval(preval);
                    } catch (ex) {
                        // just always do this - because we don't always put a var from scope here - could be a string
                        evaled = null;
                    }

                    // if filter exists, we need to evaluate it
                    if (filters.length) {
                        while (filters.length) {
                            filterChunk = filters.shift().trim();
                            chunks = filterChunk.split(':'); // in case there are inputs
                            filter = chunks.shift();

                            // couldn't get this to work with map()
                            for (i = 0, len = chunks.length; i < len; ++i) {
                                eval('chunks[i] = ' + chunks[i] + ';');
                            }

                            chunks.unshift(evaled);
                            var filterSource = (model[filter] ? model : savedFilters);
                            evaled = filterSource[filter].apply(this, chunks);
                        }
                    }

                    transScope = jytToJng.getDirectiveScope(model, attrValue, evaled);
                    transElement = jytToJng.getDirectiveElement(e);
                    transAttrs = jytToJng.getDirectiveAttrs(e, attrNormal, evaled);

                    transforms[attrNormal](transScope, transElement, transAttrs, evaled);
                }

                // can happen, in, say, ng-if
                if (!e.attributes) {
                    break;
                }
                // if we are stripping attributes and this on starts ng- or is in transforms, remove it
                else if (model[JNG_STRIP_DIRECTIVES] === true &&
                    e.attributes.hasOwnProperty(attr) &&
                    (attr.indexOf('ng-') === 0 || transforms.hasOwnProperty(attr))) {

                    delete(e.attributes[attr]);
                }
            }

            // removes previously appended attribute if it's there
            if (e.ngRepeat) {
                delete e.ngRepeat;
            }
        }

        // ng-repeat gets pretty special treatment and re-scoping (see use of outer function)
        if (e.ngRepeat) {
            e = ngRepeat(model, e);
        }
        // else if we have children, recurse through them
        else if (e.children) {

            if (needsStripping) {
                model[JNG_STRIP_DIRECTIVES] = true;
            }

            for (i = 0, len = e.children.length; i < len; i++) {
                e.children[i] = angularizeNode(e.children[i]);
            }

            if (needsStripping) {
                model[JNG_STRIP_DIRECTIVES] = false;
            }
        }

        return e;
    }

    // return the templatized element
    return angularizeNode(e);
}

// the recursion within angularize dives down here to evaluate ngRepeat
ngRepeat = function ngRepeat(scope, e) {
    var repeatStatement = e.ngRepeat.match(patternRepeatStmt);
    var reps = [];
    var repeatVar = repeatStatement[1];
    var repeatArr = null;

    try {
        /* jshint evil:true */
        eval('repeatArr = scope.' + repeatStatement[2] + ';');
    }
    catch (err) {
        console.log('\n\nError evaling:\nrepeatArr = scope.' +
        repeatStatement[2] + ';\n\nwith element:\n' +
        JSON.stringify(e) + '\n\n');

        throw err;
    }

    if (repeatArr) {
        for (var i = 0, len = repeatArr.length; i < len; i++) {
            var repModel = jyt.utils.extend({}, scope, {
                '$index':   i,
                '$even':    (i % 2 === 0),
                '$odd':     (i % 2 === 1),
                '$first':   (i === 0),
                '$last':    (i === len - 1),
                '$middle':  (i > 0 && i < (len - 1))
            });

            repModel[repeatVar] = repeatArr[i];

            // without toString, overwrites variables?
            reps.push(angularize(jyt.utils.extend(true, {}, e), repModel));
        }
    }

    // correctly wraps raw array
    return jyt.naked(reps);
};

// expose functions
module.exports = {
    JNG_STRIP_DIRECTIVES: JNG_STRIP_DIRECTIVES,
    transforms: transforms,
    angularize: angularize,
    ngRepeat: ngRepeat
};
