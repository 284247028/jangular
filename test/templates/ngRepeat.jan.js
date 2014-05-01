module.exports = function(model) {
    return ul([
        li({'ng-repeat': 'foo in foos'}, [
            span({'ng-bind': 'foo.bar'}),
            ol([
                li({'data-ng-repeat': 'bar in foo.baz | coolFilter', 'ng-class': '{even: $even}'}, [
                    span({'ng-bind': 'bar'}),
                    span({'ng-bind': '$index'}),
                    span({'ng-bind': '$first'}),
                    span({'ng-bind': '$middle'}),
                    span({'ng-bind': '$last'}),
                    span({'ng-bind': '$odd'})
                ])
            ])
        ])
    ]);
};