/**
 * Author: christian
 * Date: 3/26/15
 *
 * Should be obvious: implements ngSwitch, server-side
 * for now we just need to add the val to scope
 * for ng-switch-when and ng-switch-default
 */
module.exports = function ngSwitch(scope, element, attrs) {
    var on = attrs && scope[attrs.on];
    if (on) {
        scope.__ngSwitchOn = on;
    }
};