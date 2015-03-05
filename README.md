
Jangular
==========

This library can be used to render Angular 1.x templates on the server or command line.
Note that only the Angular core directives which are used for initial page rendering
are evaluated by Jangular. If you have any custom directives, you simply need to make
Jangular aware of them before you render.

Note that this library is in beta and should not be used in production...yet. Pull
requests are welcome.

## Installation

From the command line enter:

```
npm install jangular --save
```

## Command Line Usage

The best way to play around with Jangular is to use the command line tool. Once you
complete installation, try out some of these commands to get started:

```
jangular -t '<div>{{ foo }}</div>' -d '{ "foo": "hello, world" }'
```

The output should be:

```
<div>hello, world</div>
```

Instead of passing in the template and data, you can instead just use file paths.
The following will only work if these files actually exist on your local system:

```
jangular -t somedir/blah.html -d otherdir/foo.json
```

Note that for the data file, you can use either a JSON file or a Node JavaScript
file that has a module.exports.

#### Command Line Options

* -t or --tpl - These is your Angular template. Either pass in the template html or a path to your template
* -d or --data - The scope to use when you start evaluating. Either JSON or a path to a JSON or JS file
* -s or --strip - When you include this option, all Angular directives will be stripped out of template after evaluating. See below for more explaination of why this is useful.

## Code Usage

In your Node.js code, you first need to require jangular:

```
var jangular = require('jangular');
```

The first thing you want to do is convert your HTML file to an object. Here is one
example of doing this that you can adapt to meet your needs.

```
var fs = require('fs');
var html = fs.readFileSync(__dirname + '/something.html');
jangular.htmlToObject(html, function (err, jangularDom) {

    // use jangularDom (see below)

});
```

As an alternative, you can write your HTML with [Jyt](https://github.com/gethuman/jyt)
in which case you use the Jyt function output.

```
// add all the Jyt HTML functions to the current node.js module scope
jangular.addShortcutsToScope(global);

var jangularDom = div({ 'ng-if': 'someVal', 'class': 'foo' }, span({ 'ng-bind': 'greeting' }, 'hello'));
```

Now that you have the fake DOM object used by Jangular, we can pass that into the render function.

```
var data = { someVal: true, greeting: 'Hello, world' };
var html = jangular.render(jangularDom, data);

```

Now you have the rendered HTML.

## Custom Directives

If you have a custom directive you want to have evaluated, you register it
with Jangular like this:

```
jangular.addDirective('my-foo', function (scope, element, attrs) {
    // this is the equivalent to a client side directive link() function
});
```

Then you use the directive like this:

```
var template = '<div my-foo></div>
```

I have not had time to implement all directive features on the server side.
For now, until I can add more features, the server side directive supports:

* Only changes in the link() function
* Only attribute directives
* No transclusion

I would welcome pull requests!

## Filters

You can add filters that are used as your template is rendered by doing:

```
jangular.addFilters([
    myFilter: function (array) {}
])
```

## Pancakes

This library can be used by itself to do simple Angular rendering, but if you are
interested in how this can be used for a full app, check out [pancakes.js](https://github.com/gethuman/pancakes)
and the [pancakes-angular plugin](https://github.com/gethuman/pancakes-angular) plugin.
To see how pancakes-angular is used, check out the
[sample pancakes project](https://github.com/gethuman/pancakes-sample).

## Contributing

Working on this library is pretty straightforward.

```
git clone git://github.com/gethuman/jangular.git
npm install
gulp test --cov=true
```

Here are some of the things on the ToDo list:

* All directive options (i.e. element directive, isolated scope, etc.)
* Directive transclusion
* Angular2 branch
