module.exports = function(model) {
    return div({'ng-open': 'bar == baz'},[
        div({'data-ng-open': 'bar === baz'})
    ]);
};