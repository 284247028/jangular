/**
 * Author: Jeff Whelpley
 * Date: 10/27/14
 *
 *
 */
var jngFnStart      = '__jng_fn_start__';
var jngFnEnd        = '__jng_fn_end__';
var jngFnRegex      = /(\"__jng_fn_start__|__jng_fn_end__\")/g;
var patternPrefix   = /^(x\-|data\-)/g;
var patternDelimit  = /[_:]/g;

/**
 * This is used to help stringify a model value that contains a function. We do need a hack
 * for the functions, through, so we put those in a savedFunctions object and then a
 * reference to them in the string. The reference is modified after the stringify so
 * we can remove the jngFnStart and jngFnEnd.
 *
 * @param savedFunctions
 * @param value
 * @returns {*}
 */
function stringifyIncludeFunctions(savedFunctions, value) {
    if (typeof value === 'function') {
        var fnkey = 'fn' + Object.keys(savedFunctions).length;
        savedFunctions[fnkey] = value;

        return jngFnStart + 'jngSavedFunctions[\'' + fnkey + '\']' + jngFnEnd;
    }
    else if (typeof  value === 'undefined' || value === null) {
        return '';
    }

    return value;
}

/**
 * Convert an object property into a string that can be evaluated.
 * @param obj
 * @param savedFunctions
 * @returns {*}
 */
function stringify(obj, savedFunctions) {
    var val = JSON.stringify(obj, function jngFunctionReplacer(key, value) {
        return stringifyIncludeFunctions(savedFunctions, value);
    });

    return val.replace(jngFnRegex, '');
}

/**
 * Convert a string with dashes to a camelCase string
 *      ex. my-fav-thing -> myFavThing
 *
 * @param str
 * @returns {*}
 */
function dashToCamelCase(str) {
    return str.replace(/-([a-z])/g, function (g) {
        return g[1].toUpperCase();
    });
}

/**
 *
 * @param str
 */
function camelCaseToDash(str) {
    var newStr = '';
    str.split('').map(function (val) {
        newStr += (val === val.toUpperCase()) ?
            ('-' + val.toLowerCase()) : val;
    });
    return newStr;
}

/**
 * Replace values from the attribute name that are technically valid
 * but are just extra for a name (for example, data-, x-, etc.)
 * @param attrName
 */
function normalize(attrName) {
    return attrName.replace(patternPrefix, '').replace(patternDelimit, '-');
}

/**
 * Set attribute value
 * @param attr
 * @returns {Function}
 */
function setAttribute(attr) {
    return function (scope, element, attrs, val) {
        element.attr(attr, val);
    };
}

/**
 * Set attribute by boolean
 * @param attr
 * @returns {Function}
 */
function setAttributeBool(attr) {
    return function (scope, element, attrs, val) {
        if (val) {
            element.attr(attr, null);
        }
        else {
            element.removeAttr(attr);
        }
    };
}

/**
 * Add classes
 * @param clazz
 * @param invert
 * @returns {Function}
 */
function addClassBool(clazz, invert) {
    return function (scope, element, attrs, val) {
        if ((invert && !val) || (val && !invert)) {
            element.addClasses(clazz);
        }
        else {
            element.removeClasses(clazz);
        }
    };
}

// expose functions
module.exports = {
    stringifyIncludeFunctions: stringifyIncludeFunctions,
    stringify: stringify,
    dashToCamelCase: dashToCamelCase,
    camelCaseToDash: camelCaseToDash,
    normalize: normalize,
    setAttribute: setAttribute,
    setAttributeBool: setAttributeBool,
    addClassBool: addClassBool
};