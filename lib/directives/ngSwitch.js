/**
 * Copyright 2015 GetHuman LLC
 * Author: christian
 * Date: 3/26/15
 *
 * Should be obvious: implements ngSwitch, server-side
 */

module.exports = function ngSwitch(scope, element, attrs, val) {

    // if no on attribute, just return element
    if (!attrs || !attrs.hasOwnProperty('on')) {
        return;
    }

    var on = null;

    /* jshint evil:true */
    eval('on = scope.' + attrs.on + ';');

    if ( !on ) {
        return;
    } else {
        // for now we just need to add the val to scope for ng-switch-when and ng-switch-default
        scope['__ngSwitchOn'] = on;
    }
};