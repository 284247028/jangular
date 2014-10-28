
Jangular
==========

This library works with [Jyt](https://github.com/gethuman/jyt) to render Angular HTML
markup on the server. This is how it works at a high level:

1. Write your HTML using [Jyt](https://github.com/gethuman/jyt).
    * `div({ 'class': 'foo' }, span('hello'))`
2. Add Angular markup to your Jyt markup.
    * `var markup = div({ 'ng-if': 'someVal', 'class': 'foo' }, span({ 'ng-bind': 'greeting' }, 'hello'))`
3. Pass your markup into Jangular with a model.
    * `var html = jangular.render(markup, { someVal: true, greeting: 'Hello, world' })`
4. You now have rendered HTML in a string that you can return to the user or whatever else you want.
    * `<div ng-if="someVal" class="foo"><span ng-bind="greeting">Hello, world</span></div>`

## Installation

From the command line enter:

```
npm install jangular --save
```

Then use Jangular anywhere in your node.js code. For example:

```
var jangular = require('jangular');

// add all the HTML functions to the local scope
jangular.addShortcutsToScope(global);

var markup = div({ 'ng-if': 'someVal', 'class': 'foo' }, span({ 'ng-bind': 'greeting' }, 'hello'));
var html = jangular.render(markup, { someVal: true, greeting: 'Hello, world' });

console.log(html);
// output: <div ng-if="someVal" class="foo"><span ng-bind="greeting">Hello, world</span></div>
```

## API

The following functions are available with Jangular:

* render(markup, model, strip) - As described above. Strip is a boolean that will remove Angular directives after rendering them.
* addShortcutsToScope(obj) - This will add all the HTML functions to whatever object is passed in.
* registerPlugin(name, fn) - This is used to register a Jyt plugin.
* addDirective(name, fn) - Add a custom directive to Jangular (essentially a callback to the directive's link() function)
* addFilters(name, arr) - Add filters Jangular will evaluate while rendering

## Pancakes

While this library can be used on its own without any issues, it was design to work with
[Pancakes](https://github.com/gethuman/pancakes) through the [pancakes-angular plugin](https://github.com/gethuman/pancakes-angular).
Basically, this library is dumb about how it is used. It simple rendering Jyt markup with Angular any registered
Angular directives. Pancakes-angular is used to generate a set of custom directives based off the app that is
using Pancakes.
