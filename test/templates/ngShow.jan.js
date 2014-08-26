module.exports = function(model) {
    return div({'ng-show': 'bar == baz'},
        span({'ng-show': 'foo == baz'})
    );
};