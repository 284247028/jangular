/**
 * Author: Jeff Whelpley
 * Date: 10/27/14
 *
 *
 */
var name    = 'jangular.utils';
var taste   = require('taste');
var target  = taste.target(name);

describe('UNIT ' + name, function () {
    describe('stringifyIncludeFunctions()', function () {
        it('should return empty string if value undefined', function () {
            target.stringifyIncludeFunctions({}).should.equal('');
        });

        it('should set savedFunctions and return string for function', function () {
            var savedFunctions = {};
            var fn = function () {};
            var expected = '__jng_fn_start__jngSavedFunctions[\'fn0\']__jng_fn_end__';
            var actual = target.stringifyIncludeFunctions(savedFunctions, fn);
            actual.should.equal(expected);
            taste.should.exist(savedFunctions.fn0);
        });
    });

    describe('stringify()', function () {
        it('should return a stringified object', function () {
            var obj = { blah: 'yes' };
            var expected = '{"blah":"yes"}';
            var actual = target.stringify(obj, {});
            actual.should.equal(expected);
        });
    });

    describe('dashToCamelCase()', function () {
        it('should translate a dash case string to camel case', function () {
            var str = 'one-two-three';
            var expected = 'oneTwoThree';
            var actual = target.dashToCamelCase(str);
            actual.should.equal(expected);
        });
    });

    describe('camelCaseToDash()', function () {
        it('should translate a camel case str to dash case', function () {
            var str = 'oneTwoThree';
            var expected = 'one-two-three';
            var actual = target.camelCaseToDash(str);
            actual.should.equal(expected);
        });
    });

    describe('normalize()', function () {
        it('should normalize an attribute', function () {
            var attrName = 'data-blah';
            var expected = 'blah';
            var actual = target.normalize(attrName);
            actual.should.equal(expected);
        });
    });


});