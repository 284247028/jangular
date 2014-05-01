'use strict';

var jangular = require('../lib/jangular.js'),
    fs = require('fs'),
    jangularGetTemplate = null,
    directiveTemplates = null;

var basicFilter = function(input, repeat) {
    var repeats = ['filtered'];
    if ( repeat && (repeat = parseInt(repeat,10)) ) {
        while( repeat-- ) {
            repeats.push('filtered');
        }
    }
    return input + ' ' + repeats.join(' ');
};
var langFilter = function(input, lang) {
    return lang + input;
};
var cdnFilter = function(input) {
    return 'http://cdn.' + input;
};
var directives = {
    'gh-directive-name': 'answers.home'
};

var tests = ['helloworld','basic',
    {name: 'model', model: {foo: "foo's content", bar: {baz: "bar.baz's content", bam: "something else"}}},
    {name: 'ngBind', model: {foo: "foo's content", bar: {baz: "bar.baz's content", bam: "something else"}}},
    {name: 'ngBindHtml', model: {foo: "<span>foo's content</span>", bar: {baz: "<i>bar.baz's content</i>", bam: "something else"}}},
    {name: 'ngChecked', model: {foo: true, bar: '14', baz: 14}},
    {name: 'ngClass', model: {foo: 'classy', bar: '14', baz: 14}},
    {name: 'ngDisabled', model: {foo: 'classy', bar: '14', baz: 14}},
    {name: 'ngHide', model: {foo: 'classy', bar: '14', baz: 14}},
    {name: 'ngHref', model: {foo: 'about:blank', bar: '14', baz: 14}},
    {name: 'ngInclude', model: {foo: 'about:blank', bar: __dirname + '/templates/ngHref.jan'}},
    {name: 'ngOpen', model: {foo: 'classy', bar: '14', baz: 14}},
    {name: 'ngReadonly', model: {foo: 'classy', bar: '14', baz: 14}},
    {name: 'ngSelected', model: {foo: 'classy', bar: '14', baz: 14}},
    {name: 'ngShow', model: {foo: 'classy', bar: '14', baz: 14}},
    {name: 'ngSrc', model: {foo: 'about:blank', bar: '14', baz: 14}},
    {name: 'ngSrcset', model: {foo: 'about:blank', bar: '14', baz: 14}},
    {name: 'ngStyle', model: {foo: 'red', bar: '14', baz: 14}},
    {name: 'ngRepeatBasic', model: {foos: ['alpha','beta']}},
    {name: 'ngRepeat', model: {foos: [{bar: 'alpha', baz: ['uno','dos']},{bar: 'beta', baz: ['un','deux']}]}},
    {name: 'ngFilterBasic', model: {foo: 'Hello world', basicFilter: basicFilter}},
    {name: 'ngFilter', model: {foo: '/img/photo.png', bar: 'en.host', langFilter: langFilter, cdnFilter: cdnFilter}},
    {name: 'ngDirectivesBasic', model: {foo: 'blah'}}
];

jangular.addShortcutsToScope(global);

jangularGetTemplate = jangular.getTemplate;
directiveTemplates = {
    'answers.home': jangularGetTemplate(__dirname + '/templates/' + 'ngDirectivesBasicDirective' + '.jan')
};
jangular.addDirectives(directives);

jangular.init({
    getTemplate: function(path) {
        if ( directiveTemplates[path] ) {
            return directiveTemplates[path];
        } else {
            return jangularGetTemplate(path);
        }
    }
});

function testYieldsSame(templateName, model) {
    return function(test) {
        test.expect(1);
        // tests here
        var browserRendered = fs.readFileSync(__dirname + '/templates/' + templateName + '.html', 'utf8');
        var jangularRendered = jangular.template(__dirname + '/templates/' + templateName + '.jan')(model);
        test.equal(browserRendered, jangularRendered, 'THESE ARE NOT THE SAME');
        test.done();
    };
}

exports.jangular = {
    setUp: function(done) {
        // setup here
        done();
    }
};

for (var i = 0, len = tests.length; i < len; ++i) {
    var test = tests[i];
    if ( test.name ) {
        exports.jangular[test.name] = testYieldsSame(test.name, test.model);
    } else {
        exports.jangular[test] = testYieldsSame(test);
    }
}

/*
 ======== Angular directives that need to be handled ========
 http://docs.angularjs.org/api

 ng-bind            YES     DONE
 ng-bind-html       YES     DONE
 ng-bind-template   no      NOT POSSIBLE
 ng-checked         YES     DONE
 ng-class           YES     DONE
 ng-class-even      LATER
 ng-class-odd       LATER
 ng-disabled        YES     DONE
 ng-form            MAYBE
 ng-hide            YES     DONE
 ng-href            YES     DONE
 ng-if              no      NOT POSSIBLE
 ng-include         YES     DONE
 ng-list            LATER
 ng-model           YES     DONE
 ng-open            YES     DONE
 ng-pluralize       LATER
 ng-readonly        YES     DONE
 ng-repeat*         YES     IN PROGRESS
 ng-selected        YES     DONE
 ng-show            YES     DONE
 ng-src             YES     DONE
 ng-srcset          YES     DONE
 ng-style           YES     DONE
 ng-switch*         no      NOT POSSIBLE
 ng-transclude      LATER
 ng-value           MAYBE
 */

/*
=============== Angular directives that do NOT need to be handled ==========
 ng-app             no
 ng-blur            no
 ng-change          no
 ng-click           no
 ng-cloak           no
 ng-controller      no
 ng-copy            no
 ng-csp             no
 ng-cut             no
 ng-dbl-click       no
 ng-focus           no
 ng-init            no
 ng-keydown         no
 ng-keypress        no
 ng-keyup           no
 ng-mouse*          no
 ng-non-bindable    no
 ng-paste           no
 ng-submit          no

 */