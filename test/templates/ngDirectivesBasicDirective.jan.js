module.exports = function (model, element, attributes) {
    return div({ 'class': 'something'}, [
        div({'ng-bind': 'question'}),
        div('two')
    ]);
};