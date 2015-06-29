/**
 * Author: Jeff Whelpley
 * Date: 10/27/14
 *
 *
 */
var patternPluralize = /\{\}/g;

/* eslint no-eval:0 */
module.exports = function ngPluralize(scope, element, attrs) {

    // if no count or when, then return e without doing anything
    if (!attrs || !attrs.hasOwnProperty('count') || !attrs.hasOwnProperty('when')) {
        return;
    }

    //TODO: this will ONLY work if the value of count is a model variable; if not, will throw error
    // ok for now since not used that often and will almost always have a model value
    var when = null, count = 0, counted = 0; // count is the actual count, counted is count minus offset

    /* jshint evil:true */
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
    else if (count === 1 && when.one) {
        result = when.one;
    }
    else if (when.other) {
        result = when.other;
    }
    result = result.replace(patternPluralize, counted.toString());
    element.empty();
    element.text(result);
};