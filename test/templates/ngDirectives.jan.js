module.exports = function(model) {
    return [
        div({ 'gh-replace': "'ignore me'" }),
        div({ 'gh-translate': "'translate me'" }),
        div({ 'gh-src': 'foo'})
    ];
};