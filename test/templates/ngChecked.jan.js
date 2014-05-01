module.exports = function(model) {
    return div([
        input({"ng-checked": "foo", "type": "checkbox"}),
        input({"data-ng-checked": "bar == baz", "type": "checkbox"})
    ]);
};