/**
 * Author: Jeff Whelpley
 * Date: 10/24/14
 *
 * This library sits in between defining Jyt HTML functions
 * in your code and using Jyt to render a string of actual
 * HTML from the Jyt objects. This library will essentially
 * convert Angular syntax into basic stuff that Jyt knows about
 * (i.e. elements, attributes, values).
 *
 * So overall it goes like this
 *      1) Jyt functions w Angular markup in your code
 *      2) Jyt converts to Jyt objects that have Angular markup
 *      3) Jangular evaluates Angular markup into basic Jyt values
 *      4) Jyt takes updated Jyt objects and renders it to HTML
 */
var jyt         = require('jyt');
var directives  = require('./jangular.directives');
var filters     = require('./jangular.filters');
var runtime     = require('./jangular.runtime');

/**
 * This is the primary function for this library. It takes in a
 * jyt element along with an object that contains model data.
 * The output is an HTML string. In between, the angularize()
 * function will go through all the Jyt objects and transform
 * them according to built in Angular directives as well as
 * saved custom directives, filters, etc.
 *
 * @param elem
 * @param model
 * @param strip
 * @returns {*}
 */
function render(elem, model, strip) {
    model = model || {};

    if (strip) { model[runtime.JNG_STRIP_DIRECTIVES] = true; }
    var template = runtime.angularize(elem, model);
    if (strip) { delete model[runtime.JNG_STRIP_DIRECTIVES]; }

    return jyt.render(template);
}

// load all default core directives (i.e. ng-bind, etc.)
directives.init();

// these are the values exposed to external users of this library
module.exports = {
    render:                 render,
    addShortcutsToScope:    jyt.addShortcutsToScope,
    registerPlugin:         jyt.registerPlugin,
    addDirective:           directives.addDirective,
    addFilters:             filters.addFilters
};