/**
 * Created by christian on 2/25/14.
 */
module.exports = function(model) {

    return html([
        head([
            title("I am a title")
        ]),
        body(
            p("body is here"),
            input({type: 'text', 'ng-model': 'foo'})
        )
    ]);
}
