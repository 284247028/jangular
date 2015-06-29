/**
 * Author: Jeff Whelpley
 * Date: 10/27/14
 *
 *
 */
var jyt = require('jyt');

module.exports = function (scope, element, attrs, val) {
    var removes = [];
    var adds = [];

    if (jyt.utils.isObject(val)) {
        for (var prop in val) {
            if (val.hasOwnProperty(prop)) {
                if (val[prop]) {
                    adds.push(prop);
                }
                else {
                    removes.push(prop);
                }
            }
        }
    }
    else {
        adds = val;
    }

    element.removeClasses(removes);
    element.addClasses(adds);
};