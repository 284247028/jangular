/**
 * Copyright 2014 GetHuman LLC
 * Author: Jeff Whelpley
 * Date: 3/5/15
 *
 * This module contains the high level rendering logic
 */
var Q           = require('q');
var _           = require('lodash');
var jyt         = require('jyt');
var runtime     = require('./jangular.runtime');
var fs          = require('fs');
var path        = require('path');
var delim       = path.normalize('/');

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
 * @param opts
 * @returns {*}
 */
function render(elem, model, opts) {
    model = model || {};
    opts = opts || {};

    if (opts.strip) { model[runtime.JNG_STRIP] = true; }
    var template = runtime.angularize(elem, model, false);
    if (opts.strip) { delete model[runtime.JNG_STRIP]; }

    return jyt.render(template);
}

/**
 * Figure out where a file is and get the contents.
 * The trick here is that we aren't sure whether the path
 * is absolute, relative, etc.
 *
 * @param path
 */
function getFileContents(path) {
    var fullPath = path.charAt(0) === delim ? path : process.cwd() + '/' + path;
    return fs.readFileSync(fullPath, { encoding: 'utf8' });
}

/**
 * This function is used to render Angular HTML, so essentially
 * we just convert the HTML using jyt and then call render()
 *
 * @param html
 * @param model
 * @param opts
 */
function renderHtml(html, model, opts) {

    // if no html passed in just resolve with nothing
    if (!html) { return new Q(); }

    // if string is not html, assume it is a path
    var isHtml = html.trim().charAt(0) === '<';
    if (!isHtml) {
        html = getFileContents(html);
    }

    // if model is a string, can be either a stringified json or path to JSON
    if (_.isString(model)) {

        // if starts with { then assume its json
        if (model.trim().charAt(0) === '{') {
            model = JSON.parse(model);
        }
        else {
            var modelFilePath = model.charAt(0) === '/' ?
                model : process.cwd() + '/' + model;
            model = require(modelFilePath);

        }
    }

    var deferred = Q.defer();
    jyt.parse(html, function (err, jytObj) {
        if (err) { deferred.reject(err); }

        var renderedHtml = render(jytObj, model, opts);
        deferred.resolve(renderedHtml);
    });

    return deferred.promise;
}

// exposed functions
module.exports = {
    getFileContents: getFileContents,
    render: render,
    renderHtml: renderHtml
};