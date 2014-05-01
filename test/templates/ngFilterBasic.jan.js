module.exports = function(model) {
    return div({'ng:bind': 'foo | basicFilter:2'});
};