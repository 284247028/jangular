/**
 * Author: Jeff Whelpley
 * Date: 1/15/15
 *
 * Unit tests for jangular parser
 */
var name    = 'jangular.parser';
var taste   = require('taste');
var parser  = taste.target(name);

describe('UNIT ' + name, function () {
    describe('parse', function () {
        it('should return simple variable value', function () {
            var expression = 'blah';
            var context = { blah: 'yes' };
            var expected = 'yes';
            var actual = parser.parse(expression, context);
            actual.should.equal(expected);
        });

        it('should add two numbers', function () {
            var expression = 'one + two';
            var context = { one: 3, two: 5 };
            var expected = 8;
            var actual = parser.parse(expression, context);
            actual.should.equal(expected);
        });

        it('should eval something more complex', function () {
            var expression = 'joe && john || mary';
            var context = { joe: true, john: false, mary: true };
            var expected = true;
            var actual = parser.parse(expression, context);
            actual.should.equal(expected);
        });
    });
});