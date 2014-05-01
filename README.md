# jangular [![Build Status](https://secure.travis-ci.org/gethuman/jangular.png?branch=master)](http://travis-ci.org/gethuman/jangular)

A plugin for jeff.js that allows you to render pages from server-side jeff templates that contain angular syntax.

## Getting Started
Install the module with: `npm install jangular`

```javascript
var jangular = require('jangular');
jangular.template('/path/to/my/file')({aVar: 'aVal'}); // get a template then render it with a model
jangular.render('/path/to/other/file', {anotherVar: 'anotherVal}); // get and render template in one step
```

## Documentation
_(Coming soon)_

## Examples
_(Coming soon)_

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2014 GetHuman LLC. Licensed under the MIT license.
