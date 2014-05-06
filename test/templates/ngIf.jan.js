module.exports = function(model) {
    return div([
        span({'ng-if': 'foo'}),
        span({'ng-if': "nonexistentVar"})
    ]);
};