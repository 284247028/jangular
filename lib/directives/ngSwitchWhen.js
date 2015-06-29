/**
 * Copyright 2015 GetHuman LLC
 * Date: 3/26/15
 *
 * Another piece of ngSwitch
 */
module.exports = function ngSwitchWhen(scope, element, attrs, val, valBeforeEval) {
    if (!(scope.__ngSwitchOn && valBeforeEval === scope.__ngSwitchOn)) {
        element.remove();
    }
    else {
        scope.__ngSwitchOnTaken = true;
    }
};
