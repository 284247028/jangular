/**
 * Author: Jeff Whelpley
 * Date: 10/24/14
 *
 * This library sits in between defining Jyt HTML functions
 * in your code and using Jyt to render a string of actual
 * HTML from the Jyt objects. This library will essentially
 * convert Angular syntax into basic stuff that Jyt knows about
 * (i.e. elements, attributes, values).
 */
var jyt         = require('jyt');
var directives  = require('./jangular.directives');
var filters     = require('./jangular.filters');
var engine      = require('./jangular.engine');

// load all default core directives (i.e. ng-bind, etc.)
directives.init();

// these are the values exposed to external users of this library
module.exports = {
    render:                 engine.render,
    renderHtml:             engine.renderHtml,
    htmlToObject:           jyt.parse,
    jytRender:              jyt.render,
    addShortcutsToScope:    jyt.addShortcutsToScope,
    registerPlugin:         jyt.registerPlugin,
    addDirective:           directives.addDirective,
    addFilters:             filters.addFilters
};