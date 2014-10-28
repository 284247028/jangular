/**
 * Author: Jeff Whelpley
 * Date: 10/27/14
 *
 *
 */
module.exports = function (scope, element, attrs, val) {
    if (element.tag === 'input' && typeof(val) !== 'undefined' && val !== null && val.toString) {
        element.attr('value', val.toString());
    } else if (element.tag === 'textarea' && typeof(val) !== 'undefined' && val !== null && val.toString) {
        element.empty();
        element.text(val.toString());
    }
};
