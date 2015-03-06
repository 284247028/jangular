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
var Q           = require('q');
var jyt         = require('jyt');
var directives  = require('./jangular.directives');
var filters     = require('./jangular.filters');
var engine      = require('./jangular.engine');

// load all default core directives (i.e. ng-bind, etc.)
directives.init();

/**
 * Wrapper around parse
 * @param html
 * @param cb
 */
function htmlToObject(html, cb) {
    var deferred = Q.defer();

    jyt.parse(html, function (err, jytObj) {
        if (cb) {
            cb(err, jytObj);
        }

        if (err) {
            deferred.reject(err);
        }
        else {
            deferred.resolve(jytObj);
        }
    });

    return deferred.promise;
}

// these are the values exposed to external users of this library
module.exports = {
    render:                 engine.render,
    renderHtml:             engine.renderHtml,
    htmlToObject:           htmlToObject,
    jytRender:              jyt.render,
    addShortcutsToScope:    jyt.addShortcutsToScope,
    registerPlugin:         jyt.registerPlugin,
    registerComponents:     jyt.registerComponents,
    addDirective:           directives.addDirective,
    addFilters:             filters.addFilters
};