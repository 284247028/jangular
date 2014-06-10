'use strict';

var jangular = require('../lib/jangular.js'),
    fs = require('fs'),
    jangularGetTemplate = null,
    directiveTemplates = null;

var filters = {
    basicFilter: function(input, repeat) {
        var repeats = ['filtered'];
        if ( repeat && (repeat = parseInt(repeat,10)) ) {
            while( repeat-- ) {
                repeats.push('filtered');
            }
        }
        return input + ' ' + repeats.join(' ');
    },
    langFilter: function(input, lang) {
        return lang + input;
    },
    cdnFilter: function(input) {
        return 'http://cdn.' + input;
    },
    translateFilter: function(input) {
        return input + ' is translated!';
    }
};

var directives = {
    'gh-directive-name': 'answers.home',
    'gh-replace': {
        type: 'replace',
        path: 'test.replace'
    },
    'gh-translate': {
        type: 'bindAndFilter',
        filters: [
            filters.translateFilter
        ]
    },
    'gh-src': {
        type: 'attributeAndFilter',
        filters: [
            filters.cdnFilter
        ],
        attribute: 'src'
    }
};

var tests = ['helloworld',
    {name: 'basic', model: {foo: 'hello'}},
    {name: 'model', model: {foo: "foo's content", bar: {baz: "bar.baz's content", bam: "something else"}}},
    {name: 'ngBind', model: {foo: "foo's content", bar: {baz: "bar.baz's content", bam: "something else", boo: function(input) { return 'boo: ' + input; }}, blah: function(input) {
        // i'm a comment!
        return 'blah was ' + input;
    }, 'nullVar': null, 'undefVar': undefined}},
    {name: 'ngBindHtml', model: {foo: "<span>foo's content</span>", bar: {baz: "<i>bar.baz's content</i>", bam: "something else"}}},
    {name: 'ngChecked', model: {foo: true, bar: '14', baz: 14}},
    {name: 'ngClass', model: {foo: 'classy', bar: '14', baz: 14}},
    {name: 'ngDisabled', model: {foo: 'classy', bar: '14', baz: 14}},
    {name: 'ngHide', model: {foo: 'classy', bar: '14', baz: 14}},
    {name: 'ngHref', model: {foo: 'about:blank', bar: '14', baz: 14}},
    {name: 'ngIf', model: {foo: 'var'}},
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
    {name: 'ngFilterBasic', model: {foo: 'Hello world', basicFilter: filters.basicFilter}},
    {name: 'ngFilter', model: {foo: '/img/photo.png', bar: 'en.host', langFilter: filters.langFilter, cdnFilter: filters.cdnFilter}},
    {name: 'ngDirectivesBasic', model: {foo: 'blah'}},
    {name: 'ngDirectives', model: {foo: 'localhost'}},
    {name: 'ngEvalAttributes', model: {foo: 'about:foo', bar: 'about:bar'}},
    {name: 'ngPluralize', model: {foo: 1, bar: 4, baz: 0}}

];

jangular.addShortcutsToScope(global);

jangularGetTemplate = jangular.getTemplate;
directiveTemplates = {
    'answers.home': jangularGetTemplate(__dirname + '/templates/' + 'ngDirectivesBasicDirective' + '.jan'),
    'test.replace': jangularGetTemplate(__dirname + '/templates/' + 'ngDirectivesTestReplace' + '.jan')
};

jangular.addFilters(filters);
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

 ng-bind            YES     DONE            BOOTSLAP
 ng-bind-html       YES     DONE            BOOTSLAP
 ng-bind-template   no      NOT POSSIBLE
 ng-checked         YES     DONE            BOOTSLAP
 ng-class           YES     DONE            BOOTSLAP
 ng-class-even      LATER                   BOOTSLAP
 ng-class-odd       LATER                   BOOTSLAP
 ng-disabled        YES     DONE            BOOTSLAP
 ng-form            MAYBE
 ng-hide            YES     DONE            BOOTSLAP
 ng-href            YES     DONE            BOOTSLAP
 ng-if*             no      YES*            BOOTSLAP?
 ng-include         YES     DONE            not possible
 ng-list            LATER
 ng-model           YES     DONE            BOOTSLAP*
 ng-open            YES     DONE            BOOTSLAP
 ng-pluralize       LATER                   BOOTSLAP
 ng-readonly        YES     DONE            BOOTSLAP
 ng-repeat          YES     DONE
 ng-selected        YES     DONE            BOOTSLAP
 ng-show            YES     DONE            BOOTSLAP
 ng-src             YES     DONE            BOOTSLAP
 ng-srcset          YES     DONE            BOOTSLAP
 ng-style           YES     DONE            BOOTSLAP
 ng-switch*         no      YES*            BOOTSLAP?
 ng-transclude      LATER
 ng-value           MAYBE

   *can leave a hole where DOM should be if doesn't eval to true
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