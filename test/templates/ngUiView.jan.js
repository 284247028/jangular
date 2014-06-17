/**
 * Created by christian on 2/25/14.
 */
module.exports = function(model) {

    return body(
        div({'ng-bind': 'foo'}),
        div({'ui-view': null},
            span({'ng-bind': 'foo'}),
            span({'gh-simple': null})
        ),
        div({'ng-bind': 'foo'})
    );
}
