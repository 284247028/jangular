module.exports = function(model) {
    return html([
        head([
            title("I am a page title")
        ]),
        body([
            div([
                h1("I am a header"),
                p({"ng-bind": "foo"}, "...and I am a section with foo"),
                p({"data-ng-bind": "bar.baz"}, "...and I am a section with bar.baz"),
                span({'ng-bind': "blah(foo)"}),
                span({'ng-bind': "bar.boo(foo)"}),
                span({'ng-bind': "nullVar"}),
                span({'ng-bind': "undefVar"})
            ])
        ])
    ]);
};