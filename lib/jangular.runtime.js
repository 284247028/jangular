/**
 * Author: Jeff Whelpley
 * Date: 10/27/14
 *
 * This is used to render a jangular element
 */
var _                   = require('lodash');
var jyt                 = require('jyt');
var jytToJng            = require('./jangular.jytToJng');
var utils               = require('./jangular.utils');
var parser              = require('./jangular.parser');
var savedFilters        = require('./jangular.filters').savedFilters;
var patternRepeatStmt   = /^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?\s*$/;
var JNG_STRIP           = '__jng_strip_directives__';
var transforms          = {};
var transformsIgnored   = {}; // for client-side directives- we need to strip them, but also not actually angularize them server-side
var repeatStmtCache     = {};

/**
 * Loop through all attributes and modify the current element as appropriate
 * @param e
 * @param scope
 */
function angularizeAttrs(e, scope) {
    var attrs = e.attributes;
    var attrNormal, attrValue, isFilterAttr, evaled, transScope, transAttrs;

    // get the element as an angular object
    var transElement = jytToJng.getDirectiveElement(e);

    // if text on element, eval it for curl braces
    if (e.text) {
        e.text = parser.evalBracketValue(e.text, scope, savedFilters);
    }

    // loop through all the attributes
    for (var attr in attrs) {
        if (!attrs.hasOwnProperty(attr)) { continue; }

        // remove unnecessary attribute name values like data-, x-, etc.
        attrNormal = utils.normalize(attr);

        // anything under ui-view or jng-strip will have angular values stripped
        if (attr === 'ui-view' || attr === 'jng-strip') {
            e.startStrip = true;
            continue;
        }

        // get attribute value and if starts {{, then parse value
        attrValue = attrs[attr];

        // if no transform, continue to next attribute
        if (!(transforms[attrNormal] || transformsIgnored[attrNormal])) {

            // if there are brackets, they will be evaluated
            e.attributes[attr] = parser.evalBracketValue(attrValue, scope, savedFilters);

            // continue to next element in loop
            continue;
        }

        if ( transforms[attrNormal] ) {
            // get the value and see if the attr name is a filter (i.e. f-)
            isFilterAttr = attr.charAt(0) === 'f' && attr.charAt(1) === '-';

            // as long as not f-, we will want to try and evaluate the attribute value
            evaled = isFilterAttr ? null : parser.parse(attrValue, scope, savedFilters);

            // these are set up so that in the transform below,
            // the directive link fn will have access to the attribute value
            transScope = jytToJng.getDirectiveScope(scope, attrValue, evaled);
            transAttrs = jytToJng.getDirectiveAttrs(e, attrNormal, evaled);

            // now run the transform function (i.e. directive link() fn) to modify the element
            transforms[attrNormal](transScope, transElement, transAttrs, evaled, attrValue);
        }

        // failsafe in case transform removed the attributes
        if (!e.attributes) { break; }

        // if we are stripping attributes and this one starts ng- or is in transforms, remove it
        if (scope[JNG_STRIP] === true && e.attributes.hasOwnProperty(attr) &&
            (attr.indexOf('ng-') === 0 || transforms.hasOwnProperty(attr) || transformsIgnored.hasOwnProperty(attr))
        //attr === 'gh-validate' ||  attr === 'typeahead' ||
        ) {
            delete e.attributes[attr];
        }
    }
}

/**
 * Recurisve function that goes down elements and processes angular attributes at each level
 * @param e
 * @param scope
 * @param isInRepeat
 * @returns {*}
 */
function angularize(e, scope, isInRepeat) {
    var i, len, repeatStatement, reps, repeatVar, repeatArr, repeatModel, startStrip;
    var repeatElem = null;

    // if e doesn't exist or is a string, return here
    if (!e || _.isString(e)) { return e; }

    // if there is any ng-repeat on element, gets special treatment
    var attrs = e.attributes;
    var ngRepeatVal = attrs && (attrs['ng-repeat'] || attrs['data-ng-repeat']);
    if (ngRepeatVal && !isInRepeat) {

        // break up the repeat statement into parts (i.e. user in users => ['user', 'in', 'users']
        repeatStatement = repeatStmtCache[ngRepeatVal] || ngRepeatVal.match(patternRepeatStmt);
        repeatStmtCache[ngRepeatVal] = repeatStatement;

        reps = [];
        repeatVar = repeatStatement[1];
        repeatArr = parser.parse(repeatStatement[2], scope, savedFilters);

        // if we are stripping stuff, remove ng-repeat
        if (scope[JNG_STRIP]) {
            delete e.attributes['ng-repeat'];
            delete e.attributes['data-ng-repeat'];
        }

        if (repeatArr) {
            for (i = 0, len = repeatArr.length; i < len; i++) {

                // create a model that has everything from scope plus some angular meta data & ng-repeat data
                repeatModel = _.extend({}, scope, {
                    '$index':   i,
                    '$even':    (i % 2 === 0),
                    '$odd':     (i % 2 === 1),
                    '$first':   (i === 0),
                    '$last':    (i === len - 1),
                    '$middle':  (i > 0 && i < (len - 1))
                });
                repeatModel[repeatVar] = repeatArr[i];

                // also clone the element for use in the ng-repeat
                repeatElem = _.cloneDeep(e);

                // add angularized element to array that can be returned for this ng-repeat
                reps.push(angularize(repeatElem, repeatModel, true));
            }
        }

        // correctly wraps raw array
        return jyt.naked(reps);
    }

    // if e is an array, we need to recurse with each item in the array
    if (_.isArray(e)) {
        for (i = 0; i < e.length; i++) {
            e[i] = angularize(e[i], scope, false);
        }

        return e;
    }

    // if we get here, we are going to process the current element, so eval the attrs
    angularizeAttrs(e, scope);

    // then if there are children, recurse through them
    if (e.children) {
        startStrip = e.startStrip;
        delete e.startStrip;

        if (startStrip) { scope[JNG_STRIP] = true; }

        len = e.children.length;
        for (i = 0; i < len; i++) {
            e.children[i] = angularize(e.children[i], scope, false);
        }

        if (startStrip) { scope[JNG_STRIP] = false; }
    }

    // finally return the element which should now be fully angularized
    return e;
}

// expose functions
module.exports = {
    JNG_STRIP:          JNG_STRIP,
    transforms:         transforms,
    transformsIgnored:  transformsIgnored,
    angularizeAttrs:    angularizeAttrs,
    angularize:         angularize
};
