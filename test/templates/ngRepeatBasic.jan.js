module.exports = function(model) {
    return ul([
        li({'ng-repeat': 'foo in foos'}, [
            span({'ng-bind': 'foo'}),
            span({'ng-bind': '$index'})
        ])
    ]);
};