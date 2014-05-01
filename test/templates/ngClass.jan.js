module.exports = function(model) {
    return div({'ng-class': 'foo'}, [
        span({'data-ng-class': '{spunky: bar == baz, sparkly: bar === baz}'}),
        span({'data-ng-class': '["dopey","sneezy doc","bashful"]'})
    ]);
};