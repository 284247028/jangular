/**
 * Author: Jeff Whelpley
 * Date: 10/27/14
 *
 * Convert a jyt value to jng
 */
var jyt = require('jyt');
var utils = require('./jangular.utils');

/**
 * Get the directive scope based on the model
 * @param model
 * @param attrValue
 * @param val
 * @returns {*}
 */
function getDirectiveScope(model, attrValue, val) {
    if (!model) { return model; }

    model.$watch = function (name, fn) {

        // if the attribute contains the value we are looking for
        if (name === attrValue) {
            fn(val);
        }
        // or the attribute contains the name of a bound value
        else {
            fn(model[name]);
        }
    };

    return model;
}

/**
 * Generate element for directive based on the jyt directive
 * @param e
 * @returns {{}}
 */
function getDirectiveElement(e) {
    var element = {};
    element.tag = e.tag;

    element.text = function text(str) {
        e.text = str;
    };

    element.remove = function remove() {
        e.tag = e.text = e.children = e.attributes = null;
    };

    element.css = function css(val) {
        if (jyt.utils.isObject(val)) {
            var styles = e.attributes.style ? e.attributes.style.split(';') : [];
            for (var prop in val) {
                if (val.hasOwnProperty(prop)) {
                    styles.push(prop + ':' + val[prop]);
                }
            }

            e.attributes.style = styles.join(';');
        }
    };

    element.attr = function attr(name, val) {
        if (val || val === null) {
            e.attributes = e.attributes || {};
            e.attributes[name] = val;
        }

        return e.attributes[name];
    };

    element.removeAttr = function removeAttr(name) {
        delete e.attributes[name];
    };

    element.addClasses = function addClasses(clazz) {
        var newClasses = (clazz ? (jyt.utils.isArray(clazz) ? clazz : clazz.split(' ')) : []);
        var classes, newClass, i;

        if (newClasses.length < 1) {
            return;
        }

        if (!e.attributes['class']) {
            e.attributes['class'] = jyt.utils.isArray(clazz) ? clazz.join(' ') : clazz;
        }
        else {
            classes = e.attributes['class'].split(' ');
            i = newClasses.length;
            while (i--) {
                newClass = newClasses[i];
                if (classes.indexOf(newClass) < 0) {
                    classes.push(newClass);
                }
            }

            e.attributes['class'] = classes.join(' ');
        }
    };

    element.removeClasses = function removeClasses(clazz) {
        if (!e.attributes['class']) {
            return;
        }

        clazz = (jyt.utils.isArray(clazz) ? clazz : clazz.split(' '));

        var classes = e.attributes['class'].split(' ');
        var i = clazz.length;
        var classIdx;

        while (i--) {
            classIdx = classes.indexOf(clazz[i]);

            if (classIdx > -1) {
                classes.splice(classIdx, 1);
            }
        }

        if (classes.length > 0) {
            e.attributes['class'] = classes.join(' ');
        }
        else {
            delete e.attributes.class;
        }
    };

    element.empty = function empty() {
        e.children = null;
        e.text = null;
    };

    return element;
}

/**
 * Get directive attributes
 * @param e
 * @param directiveName
 * @param val
 * @returns {*|{}|any|void}
 */
function getDirectiveAttrs(e, directiveName, val) {
    var attrs = jyt.utils.extend({}, e.attributes);
    var directiveNameCamel = utils.dashToCamelCase(directiveName);
    attrs[directiveNameCamel] = attrs[directiveName];

    //** $observe is the server side implementation of angular's attrs.$observe
    attrs.$observe = function observe(attrName, fn) {

        // $observe should give back the evaluated version
        if (attrName === directiveNameCamel || attrName === directiveName) {
            fn(val);
        }
        else {
            fn(attrs[attrName]);
        }
    };

    //** server side implementation of angular's attrs.$set
    attrs.$set = function set(name, val) {
        e.attributes[name] = val;
    };

    return attrs;
}

// expose functions
module.exports = {
    getDirectiveScope: getDirectiveScope,
    getDirectiveElement: getDirectiveElement,
    getDirectiveAttrs: getDirectiveAttrs
};