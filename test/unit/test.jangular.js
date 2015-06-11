/**
 * Author: Jeff Whelpley
 * Date: 10/27/14
 *
 *
 */
var name    = 'jangular';
var taste   = require('taste');
var target  = taste.target(name);
var filters;

// we want to use undefined vars here since all the jyt funcs are on global
/* jshint undef:false */

describe('UNIT ' + name, function () {

    before(function () {

        // add all the jyt HTML function so the scope of this module
        target.addShortcutsToScope(global);

        filters = {
            basicFilter: function (input, repeat) {
                var repeats = ['filtered'];
                if (repeat && (repeat = parseInt(repeat, 10))) {
                    while (repeat--) {
                        repeats.push('filtered');
                    }
                }
                return input + ' ' + repeats.join(' ');
            },
            langFilter: function (input, lang) {
                return lang + input;
            },
            cdnFilter: function (input) {
                return 'http://cdn.' + input;
            },
            translateFilter: function (input) {
                return input + ' is translated!';
            }
        };

        // add all filters to jyt
        target.addFilters(filters);
    });

    describe('render()', function () {
        it('should test basic', function () {
            var elem = html([
                head([
                    title('I am a title')
                ]),
                body(
                    p('body is here'),
                    input({type: 'text', 'ng-model': 'foo'})
                )
            ]);
            var model = {foo: 'hello'};
            var expected = '<html><head><title>I am a title</title></head><body><p>body is here</p><input type="text" ng-model="foo" value="hello"/></body></html>';
            var actual = target.render(elem, model);
            actual.should.equal(expected);
        });

        it('should test helloworld', function () {
            var elem = 'Hello World';
            var model = {};
            var expected = 'Hello World';
            var actual = target.render(elem, model);
            actual.should.equal(expected);
        });

        it('should test ngBind', function () {
            var elem = html([
                head([
                    title('I am a page title')
                ]),
                body([
                    div([
                        h1('I am a header'),
                        p({'ng-bind': 'foo'}, '...and I am a section with foo'),
                        p({'data-ng-bind': 'bar.baz'}, '...and I am a section with bar.baz'),
                        span({'ng-bind': 'blah(foo)'}),
                        span({'ng-bind': 'bar.boo(foo)'}),
                        span({'ng-bind': 'nullVar'}),
                        span({'ng-bind': 'undefVar'})
                    ])
                ])
            ]);
            var model = {
                foo: 'foo\'s content',
                bar: {
                    baz: 'bar.baz\'s content',
                    bam: 'something else',
                    boo: function (input) {
                        return 'boo: ' + input;
                    }
                },
                blah: function (input) {
                    // i'm a comment!
                    return 'blah was ' + input;
                },
                'nullVar': null,
                'undefVar': undefined
            };
            var expected = '<html><head><title>I am a page title</title></head><body><div><h1>I am a header</h1><p ng-bind="foo">foo\'s content</p><p data-ng-bind="bar.baz">bar.baz\'s content</p><span ng-bind="blah(foo)">blah was foo\'s content</span><span ng-bind="bar.boo(foo)">boo: foo\'s content</span><span ng-bind="nullVar"></span><span ng-bind="undefVar"></span></div></body></html>';
            var actual = target.render(elem, model);
            actual.should.equal(expected);
        });

        it('should test ngBind with object', function () {
            var elem = div({'ng-bind': 'foo[bar].bam'});
            var model = {
                foo: {
                    jam: {
                        bam: 'holy crap!'
                    }
                },
                bar: 'jam'
            };
            var expected = '<div ng-bind="foo[bar].bam">holy crap!</div>';
            var actual = target.render(elem, model);
            actual.should.equal(expected);
        });

        it('should test ngBindHtml', function () {
            var elem = html([
                head([
                    title('I am a page title')
                ]),
                body([
                    div([
                        h1('I am a header'),
                        p({'ng-bind-html': 'foo'}, '...and I am a section with foo'),
                        p({'data-ng-bind-html': 'bar.baz'}, '...and I am a section with bar.baz')
                    ])
                ])
            ]);
            var model = {foo: '<span>foo\'s content</span>', bar: {baz: '<i>bar.baz\'s content</i>', bam: 'something else'}};
            var expected = '<html><head><title>I am a page title</title></head><body><div><h1>I am a header</h1><p ng-bind-html="foo"><span>foo\'s content</span></p><p data-ng-bind-html="bar.baz"><i>bar.baz\'s content</i></p></div></body></html>';
            var actual = target.render(elem, model);
            actual.should.equal(expected);
        });

        it('should test ngChecked', function () {
            var elem = div([
                input({'ng-checked': 'foo', 'type': 'checkbox'}),
                input({'data-ng-checked': 'bar == baz', 'type': 'checkbox'})
            ]);
            var model = {foo: true, bar: '14', baz: 14};
            var expected = '<div><input ng-checked="foo" type="checkbox" checked/><input data-ng-checked="bar == baz" type="checkbox" checked/></div>';
            var actual = target.render(elem, model);
            actual.should.equal(expected);
        });

        it('should test ngClass', function () {
            var elem = div({'ng-class': 'foo'}, [
                span({'data-ng-class': '{spunky: bar == baz, sparkly: bar === baz}'}),
                span({'data-ng-class': '["dopey","sneezy doc","bashful"]'})
            ]);
            var model = {foo: 'classy', bar: '14', baz: 14};
            var expected = '<div ng-class="foo" class="classy"><span data-ng-class="{spunky: bar == baz, sparkly: bar === baz}" class="spunky"></span><span data-ng-class="["dopey","sneezy doc","bashful"]" class="dopey sneezy doc bashful"></span></div>';
            var actual = target.render(elem, model);
            actual.should.equal(expected);
        });

        it('should test custom directive', function () {

            target.addDirective('gh-directive-name', function () {
                return div({ 'class': 'something'}, [
                    div({'ng-bind': 'question'}),
                    div('two')
                ]);
            });

            var elem = [
                div('header'),
                div({ 'gh-directive-name': null, question: 'foo' }),
                div('footer')
            ];
            var model = { question: 'localhost'};
            var expected = '<div>header</div><div class="something" gh-directive-name><div ng-bind="question">localhost</div><div>two</div></div><div>footer</div>';
            var actual = target.render(elem, model);
            actual.should.equal(expected);
        });

        it('should test custom directive with strip', function () {
            var elem = [
                div('header'),
                div({ 'gh-directive-name': null, question: 'foo' }),
                div('footer')
            ];
            var model = { question: 'localhost'};
            var expected = '<div>header</div><div class="something"><div>localhost</div><div>two</div></div><div>footer</div>';
            var actual = target.render(elem, model, { strip: true });
            actual.should.equal(expected);
        });

        it('should test ngDisabled', function () {
            var elem = input({'ng-disabled': 'bar == baz'});
            var model = {foo: 'classy', bar: '14', baz: 14};
            var expected = '<input ng-disabled="bar == baz" disabled/>';
            var actual = target.render(elem, model);
            actual.should.equal(expected);
        });

        it('should test ngFilter', function () {
            var elem = div([
                img({'data-ng-src': 'foo | langFilter:bar | cdnFilter'})
            ]);
            var model = {foo: '/img/photo.png', bar: 'en.host', langFilter: filters.langFilter, cdnFilter: filters.cdnFilter};
            var expected = '<div><img data-ng-src="foo | langFilter:bar | cdnFilter" src="http://cdn.en.host/img/photo.png"/></div>';
            var actual = target.render(elem, model);
            actual.should.equal(expected);
        });

        it('should test ngFilterBasic', function () {
            var elem = div({'ng:bind': 'foo | basicFilter:2'});
            var model = {foo: 'Hello world', basicFilter: filters.basicFilter};
            var expected = '<div ng:bind="foo | basicFilter:2">Hello world filtered filtered filtered</div>';
            var actual = target.render(elem, model);
            actual.should.equal(expected);
        });

        it('should test ngHide', function () {
            var elem = div({'ng-hide': 'bar == baz'});
            var model = {foo: 'classy', bar: '14', baz: 14};
            var expected = '<div ng-hide="bar == baz" class="ng-hide"></div>';
            var actual = target.render(elem, model);
            actual.should.equal(expected);
        });

        it('should test ngHref', function () {
            var elem = a({'ng-href': 'foo'});
            var model = {foo: 'about:blank', bar: '14', baz: 14};
            var expected = '<a ng-href="foo" href="about:blank"></a>';
            var actual = target.render(elem, model);
            actual.should.equal(expected);
        });

        it('should test ngIf', function () {
            var elem = div([
                span({'ng-if': 'foo'}),
                span({'ng-if': 'nonexistentVar'})
            ]);
            var model = {foo: 'var'};
            var expected = '<div><span ng-if="foo"></span></div>';
            var actual = target.render(elem, model);
            actual.should.equal(expected);
        });

        it('should test ngOpen', function () {
            var elem = div({'ng-open': 'bar == baz'}, [
                div({'data-ng-open': 'bar === baz'})
            ]);
            var model = {foo: 'classy', bar: '14', baz: 14};
            var expected = '<div ng-open="bar == baz" open><div data-ng-open="bar === baz"></div></div>';
            var actual = target.render(elem, model);
            actual.should.equal(expected);
        });

        it('should test ngPluralize', function () {
            var elem = div([
                div({'ng-pluralize': null, count: 'foo', when: '{\'one\':\'1 person\',\'other\':\'{} people\'}'}),
                div({'ng-pluralize': null, count: 'bar', when: '{\'one\':\'1 person\',\'other\':\'{} people\'}'}),
                div({'ng-pluralize': null, count: 'baz', when: '{\'0\':\'Nobody\',\'one\':\'1 person\',\'other\':\'{} people\'}'}),
                div({'ng-pluralize': null, count: 'foo', offset: 2, when: '{\'0\':\'Nobody\',\'1\':\'you\',\'2\':\'you and me\',\'one\':\'you, me, and 1 other person\',\'other\':\'you, me, and {} other people\'}'}),
                div({'ng-pluralize': null, count: 'bar', offset: 2, when: '{\'0\':\'Nobody\',\'1\':\'you\',\'2\':\'you and me\',\'one\':\'you, me, and 1 other person\',\'other\':\'you, me, and {} other people\'}'})
            ]);
            var model = {foo: 1, bar: 4, baz: 0};
            var expected = '<div><div ng-pluralize count="foo" when="{\'one\':\'1 person\',\'other\':\'{} people\'}">1 person</div><div ng-pluralize count="bar" when="{\'one\':\'1 person\',\'other\':\'{} people\'}">4 people</div><div ng-pluralize count="baz" when="{\'0\':\'Nobody\',\'one\':\'1 person\',\'other\':\'{} people\'}">Nobody</div><div ng-pluralize count="foo" offset="2" when="{\'0\':\'Nobody\',\'1\':\'you\',\'2\':\'you and me\',\'one\':\'you, me, and 1 other person\',\'other\':\'you, me, and {} other people\'}">you</div><div ng-pluralize count="bar" offset="2" when="{\'0\':\'Nobody\',\'1\':\'you\',\'2\':\'you and me\',\'one\':\'you, me, and 1 other person\',\'other\':\'you, me, and {} other people\'}">you, me, and 2 other people</div></div>';
            var actual = target.render(elem, model);
            actual.should.equal(expected);
        });

        it('should test ngReadonly', function () {
            var elem = input({'ng-readonly': 'bar == baz'});
            var model = {foo: 'classy', bar: '14', baz: 14};
            var expected = '<input ng-readonly="bar == baz" readonly/>';
            var actual = target.render(elem, model);
            actual.should.equal(expected);
        });

        it('should test ngRepeatBasic', function () {
            var elem = ul([
                li({'ng-repeat': 'foo in foos'}, [
                    span({'ng-bind': 'foo'}),
                    span({'ng-bind': '$index'})
                ])
            ]);
            var model = {foos: ['alpha', 'beta']};
            var expected = '<ul><li ng-repeat="foo in foos"><span ng-bind="foo">alpha</span><span ng-bind="$index">0</span></li><li ng-repeat="foo in foos"><span ng-bind="foo">beta</span><span ng-bind="$index">1</span></li></ul>';
            var actual = target.render(elem, model);
            actual.should.equal(expected);
        });

        it('should test ngRepeatSameElement', function () {
            var elem = ul([
                li({'ng-repeat': 'foo in foos', 'ng-bind': 'foo'})
            ]);
            var model = {foos: ['alpha', 'beta']};
            var expected = '<ul><li ng-repeat="foo in foos" ng-bind="foo">alpha</li><li ng-repeat="foo in foos" ng-bind="foo">beta</li></ul>';
            var actual = target.render(elem, model);
            actual.should.equal(expected);
        });

        it('should test ngRepeat', function () {
            var elem = ul([
                li({'ng-repeat': 'foo in foos'}, [
                    span({'ng-bind': 'foo.bar'}),
                    ol([
                        li({'data-ng-repeat': 'bar in foo.baz track by bar._id | coolFilter', 'ng-class': '{even: $even}'}, [
                            span({'ng-bind': 'bar'}),
                            span({'ng-bind': '$index'}),
                            span({'ng-bind': '$first'}),
                            span({'ng-bind': '$middle'}),
                            span({'ng-bind': '$last'}),
                            span({'ng-bind': '$odd'})
                        ])
                    ])
                ])
            ]);
            var model = {foos: [{bar: 'alpha', baz: ['uno', 'dos']}, {bar: 'beta', baz: ['un', 'deux']}]};
            var expected = '<ul><li ng-repeat="foo in foos"><span ng-bind="foo.bar">alpha</span><ol><li data-ng-repeat="bar in foo.baz track by bar._id | coolFilter" ng-class="{even: $even}" class="even"><span ng-bind="bar">uno</span><span ng-bind="$index">0</span><span ng-bind="$first">true</span><span ng-bind="$middle">false</span><span ng-bind="$last">false</span><span ng-bind="$odd">false</span></li><li data-ng-repeat="bar in foo.baz track by bar._id | coolFilter" ng-class="{even: $even}"><span ng-bind="bar">dos</span><span ng-bind="$index">1</span><span ng-bind="$first">false</span><span ng-bind="$middle">false</span><span ng-bind="$last">true</span><span ng-bind="$odd">true</span></li></ol></li><li ng-repeat="foo in foos"><span ng-bind="foo.bar">beta</span><ol><li data-ng-repeat="bar in foo.baz track by bar._id | coolFilter" ng-class="{even: $even}" class="even"><span ng-bind="bar">un</span><span ng-bind="$index">0</span><span ng-bind="$first">true</span><span ng-bind="$middle">false</span><span ng-bind="$last">false</span><span ng-bind="$odd">false</span></li><li data-ng-repeat="bar in foo.baz track by bar._id | coolFilter" ng-class="{even: $even}"><span ng-bind="bar">deux</span><span ng-bind="$index">1</span><span ng-bind="$first">false</span><span ng-bind="$middle">false</span><span ng-bind="$last">true</span><span ng-bind="$odd">true</span></li></ol></li></ul>';
            var actual = target.render(elem, model);
            actual.should.equal(expected);
        });

        it('should test ngSelected', function () {
            var elem = option({'ng-selected': 'bar == baz'});
            var model = {foo: 'classy', bar: '14', baz: 14};
            var expected = '<option ng-selected="bar == baz" selected></option>';
            var actual = target.render(elem, model);
            actual.should.equal(expected);
        });

        it('should test ngShow', function () {
            var elem = div({'ng-show': 'bar == baz'},
                span({'ng-show': 'foo == baz'})
            );
            var model = {foo: 'classy', bar: '14', baz: 14};
            var expected = '<div ng-show="bar == baz"><span ng-show="foo == baz" class="ng-hide"></span></div>';
            var actual = target.render(elem, model);
            actual.should.equal(expected);
        });

        it('should test ngSrc', function () {
            var elem = img({'ng-src': 'foo'});
            var model = {foo: 'about:blank', bar: '14', baz: 14};
            var expected = '<img ng-src="foo" src="about:blank"/>';
            var actual = target.render(elem, model);
            actual.should.equal(expected);
        });

        it('should test ngSrcset', function () {
            var elem = img({'ng-srcset': 'foo'});
            var model = {foo: 'about:blank', bar: '14', baz: 14};
            var expected = '<img ng-srcset="foo" srcset="about:blank"/>';
            var actual = target.render(elem, model);
            actual.should.equal(expected);
        });

        it('should test ngStyle', function () {
            var elem = div({'ng-style': '{color: foo, \'z-index\': bar}'});
            var model = {foo: 'red', bar: '14', baz: 14};
            var expected = '<div ng-style="{color: foo, \'z-index\': bar}" style="color:red;z-index:14"></div>';
            var actual = target.render(elem, model);
            actual.should.equal(expected);
        });

        it('should test ngSwitch', function () {
            var elem = div({'ng-switch': null, 'on': 'foo'},
                div({'ng-switch-when': 'zoom'},'Was zoom!'),
                div({'ng-switch-when': 'boom'},'Was boom!'),
                div({'ng-switch-default': null},'Was nada.')
            );
            var model = {foo: 'zoom', bar: '14'};
            var expected = '<div ng-switch on="foo"><div ng-switch-when="zoom">Was zoom!</div></div>';
            var actual = target.render(elem, model);
            actual.should.equal(expected);
        });

        it('should test ngSwitchDefault', function () {
            var elem = div({'ng-switch': null, 'on': 'foo'},
                div({'ng-switch-when': 'zoom'},'Was zoom!'),
                div({'ng-switch-when': 'boom'},'Was boom!'),
                div({'ng-switch-default': null},'Was nada.')
            );
            var model = {foo: 'shazam!', bar: '14'};
            var expected = '<div ng-switch on="foo"><div ng-switch-default>Was nada.</div></div>';
            var actual = target.render(elem, model);
            actual.should.equal(expected);
        });

        it('should test ngUiView', function () {
            var elem = body(
                div({'ng-bind': 'foo'}),
                div({'ui-view': null},
                    span({'ng-bind': 'foo'})
                ),
                div({'ng-bind': 'foo'})
            );
            var model = {foo: 'blah'};
            var expected = '<body><div ng-bind="foo">blah</div><div ui-view><span>blah</span></div><div ng-bind="foo">blah</div></body>';
            var actual = target.render(elem, model);
            actual.should.equal(expected);
        });
    });

    describe('htmlToObject()', function () {
        it('should convert a simple div to an object with promise', function (done) {
            target.htmlToObject('<div></div>', null)
                .then(function (jytObj) {
                    taste.should.exist(jytObj);
                    jytObj.should.have.property('tag').that.equals('div');
                    done();
                });
        });

        it('should convert a simple div to an object with promise', function (done) {
            target.htmlToObject('<div></div>', function (err, jytObj) {
                taste.should.exist(jytObj);
                jytObj.should.have.property('tag').that.equals('div');
                done();
            });
        });

        it('should convert a div with an html comment to a tag', function (done) {
            target.htmlToObject('<div><!-- hello, world --></div>', function (err, jytObj) {
                taste.should.exist(jytObj);
                jytObj.should.have.property('tag').that.equals('div');
                done();
            });
        });
    });
});

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
 ng-include         LATER
 ng-list            LATER
 ng-model           YES     DONE            BOOTSLAP*
 ng-open            YES     DONE            BOOTSLAP
 ng-pluralize       YES     DONE            BOOTSLAP
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