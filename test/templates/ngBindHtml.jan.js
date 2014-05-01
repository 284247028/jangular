module.exports = function(model) {
    return html([
        head([
            title("I am a page title")
        ]),
        body([
            div([
                h1("I am a header"),
                p({"ng-bind-html": "foo"}, "...and I am a section with foo"),
                p({"data-ng-bind-html": "bar.baz"}, "...and I am a section with bar.baz")
            ])
        ])
    ]);
};