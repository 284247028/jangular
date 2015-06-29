/**
 * Author: Jeff Whelpley
 * Date: 10/27/14
 *
 *
 */
var name    = 'jangular.directives';
var taste   = require('taste');
var target  = taste.target(name);

describe('UNIT ' + name, function () {
    describe('init()', function () {
        it('should load all the directives from the file system', function () {
            target.init();
            taste.should.exist(target.transforms['ng-bind-html']);
        });

        it('should bind value', function () {
            var element = {
                empty: taste.spy(),
                text: taste.spy()
            };
            target.transforms['ng-bind']({}, element, {}, 'hello, world');
            element.text.should.have.been.calledWith('hello, world');
        });
    });

    describe('addDirective()', function () {
        it('should add a new directive to the transform list', function () {
            target.addDirective('my-foo', function () {});
            taste.should.exist(target.transforms['my-foo']);
        });
    });
});