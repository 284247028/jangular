module.exports = function (model) {
    return div({ 'class': 'something'}, [
        div({'ng-bind': 'question'}),
        div('two')
    ]);
};