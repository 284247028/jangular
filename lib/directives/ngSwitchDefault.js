/**
 * Copyright 2015 GetHuman LLC
 * Author: christian
 * Date: 3/26/15
 *
 * I forgot to write about what this component does
 */

module.exports = function ngSwitchDefault(scope, element) {

    if (!(scope['__ngSwitchOn'] && !scope['__ngSwitchOnTaken'])) {
        element.remove();
    }
};
