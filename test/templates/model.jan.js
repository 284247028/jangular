module.exports = function(model) {
    return html([
        head([
            title("I am a page title")
        ]),
        body([
            div([
                h1("I am a header"),
                p("...and I am a section with dynamic content drawn from variable foo: " + model.foo),
                p("...and I am a section with dynamic content drawn from variable bar.baz: " + model.bar.baz)
            ])
        ])
    ]);
};