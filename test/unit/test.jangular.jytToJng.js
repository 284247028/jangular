/**
 * Author: Jeff Whelpley
 * Date: 10/27/14
 *
 *
 */
var name    = 'jangular.jytToJng';
var taste   = require('taste');
var target  = taste.target(name);

describe('UNIT ' + name, function () {
    describe('getDirectiveScope()', function () {
        it('should use the val', function (done) {
            var scope = {};
            var attrValue = 'joe';
            var val = 'yo';
            target.getDirectiveScope(scope, attrValue, val);
            taste.should.exist(scope.$watch);

            var expected = val;
            scope.$watch(attrValue, function (actual) {
                actual.should.equal(expected);
                done();
            });
        });

        it('should use the model', function (done) {
            var scope = { foo: 'choo' };
            var attrValue = 'joe';
            var val = 'yo';
            target.getDirectiveScope(scope, attrValue, val);
            taste.should.exist(scope.$watch);

            var expected = scope.foo;
            scope.$watch('foo', function (actual) {
                actual.should.equal(expected);
                done();
            });
        });
    });

    describe('getDirectiveElement()', function () {
        it('should create a jng element', function () {
            var e = { tag: 'blah' };
            var element = target.getDirectiveElement(e);
            taste.should.exist(element.removeClasses);
            taste.should.exist(element.empty);
        });
    });

    describe('getDirectiveAttrs()', function () {
        it('should create a jng attrs object', function () {
            var e = {};
            var directiveName = 'gh-foo';
            var val = 'blah';
            var attrs = target.getDirectiveAttrs(e, directiveName, val);
            taste.should.exist(attrs.$observe);
            taste.should.exist(attrs.$set);
        });
    });
});