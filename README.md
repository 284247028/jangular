
Jangular
==========

[![Join the chat at https://gitter.im/gethuman/jangular](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/gethuman/jangular?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

This library can be used to render Angular 1.x templates on the server or command line.

Note that this library is in beta and should not be used in production...yet. Pull
requests are welcome!

## Command Line Usage

The best way to play around with Jangular is to use the command line tool. First install
Jangular globally:

```
npm install jangular -g
```

Then try out some of these commands to get started:

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
* -s or --strip - When you include this option, all Angular binding directives will be stripped out of template after evaluating.

The reason why strip is in there is that sometime you want the server side to
produce HTML without any Angular binding directives so that when Angular bootstraps, it does
not prematurally modify the rendered HTML.

## Code Usage

From the command line enter:

```
npm install jangular --save
```

In your Node.js code, you first need to require jangular:

```
var jangular = require('jangular');
```

The first thing you want to do is convert your HTML file to an object. Here is one
example of doing this that you can adapt to meet your needs.

```
var fs = require('fs');
var html = fs.readFileSync(__dirname + '/something.html');

// either pass in callback
jangular.htmlToObject(html, function (err, jangularDom) {
    // use jangularDom (see below)
});

// or you can use promises
jangular.htmlToObject(html)
    .then(function (jangularDom) {
        // use jangularDom (see below)
    })
    .catch(function (err) {
        // do something here for error
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

## How it Works

The input into the main render() function for this library is an Angular template and a JSON object
that contains the scope data used to render the template. The render() function has the following
steps:

1. Translate template from HTML to an object. This object is a tree structure that represents the DOM.
1. Traverse the tree and for each node/element:
    1. Use $parse from Angular core to evaluate expressions
    1. Run the link() method of any directives on the element (more on this below)
1. After traversal complete and transforms done, translate the DOM-like object to an HTML string.

#### Directives

This library includes support for [many of the Angular core directives](https://github.com/gethuman/jangular/tree/master/lib/directives)
but if you have a custom directive you want to have evaluated, you register it with Jangular like this:

```
jangular.addDirective('my-foo', function transform(scope, element, attrs) {
    // you can either modify the element here or return a band new element
});
```

It is up to you to define your own server side "directives". The way I suggest using this
is to come up with a vanilla JavaScript object format that represents once of your
"components" then write generic code to take your custom component objects and either
transpile them into directives on the client side or into these jangular.addDirective()
calls on the server side. An example of how we do something like this at GetHuman use this is in
[our pancakes-angular library](https://github.com/gethuman/pancakes-angular/blob/master/lib/middleware/jng.directives.js#L356).
Just note that the pancakes-angular library is much more unstable than this library so you may
want to just see how that works and create your own version.

Once you have registered a directive, you can reference it as an attribute like this:

```
var template = '<div my-foo></div>
```

#### Filters

You can add filters that are used as your template is rendered by doing:

```
jangular.addFilters([
    myFilter: function (array) {}
])
```

## Known Issues

One thing is that if you use the {{ }} expression syntax, Jangular will replace the
expression with the value. This may cause an issue if you are having the Angular
client take over because Angular will just see the evaluated value and not the
expression. For this reason, for now, we strongly suggest using ng-bind instead
of {{ }} within inner HTML.

## Use Cases

The primary use case for Jangular is when you are working on a consumer facing
app where visitors come from external links, search results and/or ads. In that case,
the initial page load performance has a big impact on bounce rate (the rate at which
users leave your site after one page view) and thus your search ranking.

## Pancakes

This library can be used by itself to do simple Angular rendering, but if you are
interested in how this can be used for a full app, check out [pancakes.js](https://github.com/gethuman/pancakes)
and the [pancakes-angular plugin](https://github.com/gethuman/pancakes-angular) plugin.
To see how pancakes-angular is used, check out the
[sample pancakes project](https://github.com/gethuman/pancakes-sample). Just note that
the pancakes libraries are extremely opinionated and have not been tested with
anything outside of GetHuman.

## Contributing

Working on this library is pretty straightforward.

```
git clone git://github.com/gethuman/jangular.git
npm install
gulp test --cov=true
```

Here are some of the things on the ToDo list:

* Update to Angular 1.4 $parse
* An easier way to register directives
* Directive transclusion (requires modifications to traversal algorithm)
* Angular2 branch
