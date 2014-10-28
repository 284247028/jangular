/**
 * Author: Jeff Whelpley
 * Date: 10/27/14
 *
 * Replace contents of an element with the string version of the value
 */
module.exports = function (scope, element, attrs, val) {
    element.empty();

    var isBindingVal = typeof(val) !== 'undefined' && val !== null && val.toString;
    var bindingVal = isBindingVal ? val.toString() : '';

    element.text(bindingVal);
};