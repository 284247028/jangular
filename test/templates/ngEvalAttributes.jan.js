// var evalAttributes = ['href', 'src', 'title', 'placeholder', 'popover', 'value', 'alt'];
module.exports = function(model) {
    return [
        span({'eval-id': 'bar'}),
        span({'eval-href': 'foo'}),
        span({'eval-src': 'bar'}),
        span({'eval-title': 'foo'}),
        span({'eval-placeholder': 'bar'}),
        span({'eval-popover': 'foo'}),
        span({'eval-value': 'bar'}),
        span({'eval-alt': 'foo'}),
        span({'eval-title': "'just a string'"}),
        span({'ng-if': 'false', 'eval-title': "'just another string'"})
    ];
};