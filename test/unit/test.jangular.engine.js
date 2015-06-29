/**
 * Author: Jeff Whelpley
 * Date: 3/5/15
 *
 * Testing the jangular rendering engine
 */
var name        = 'jangular.engine';
var taste       = require('taste');
var target      = taste.target(name);
var directives  = taste.target('jangular.directives');
var path        = require('path');

describe('UNIT ' + name, function () {

    // we want to initialize the directives so we can test some stuff
    before(function () {
        directives.init();
    });

    describe('getFileContents()', function () {
        it('should get a file with a relative path', function () {
            var filePath = 'test/fixtures/engine.txt';
            var expected = 'this is a test';
            var actual = target.getFileContents(filePath);
            actual.should.equal(expected);
        });

        it('should do relative path with ..', function () {
            var filePath = 'test/../test/fixtures/engine.txt';
            var expected = 'this is a test';
            var actual = target.getFileContents(filePath);
            actual.should.equal(expected);
        });

        it('should throw an error if file does not exist', function () {
            var filePath = 'blahblahblah/engine.txt';
            var fn = function () {
                target.getFileContents(filePath);
            };
            fn.should.throw(/ENOENT/);
        });

        it('should load a full path', function () {
            var filePath = path.join(__dirname, '../fixtures/engine.txt');
            var expected = 'this is a test';
            var actual = target.getFileContents(filePath);
            actual.should.equal(expected);
        });
    });

    describe('renderHtml()', function () {
        it('should render basic html with no code', function () {
            var html = '<div>hello, world</div>';
            var expected = html;
            var actual = target.renderHtml(html);
            return actual.should.eventually.equal(expected);
        });

        it('should render html with ng-bind', function () {
            var html = '<div ng-bind="foo"></div>';
            var model = { foo: 'word up' };
            var expected = '<div ng-bind="foo">word up</div>';
            var actual = target.renderHtml(html, model);
            return actual.should.eventually.equal(expected);
        });

        it('should render html with ng-bind and strip', function () {
            var html = '<div ng-bind="foo"></div>';
            var model = { foo: 'word up' };
            var expected = '<div>word up</div>';
            var actual = target.renderHtml(html, model, { strip: true });
            return actual.should.eventually.equal(expected);
        });

        it('should render from an html file', function () {
            var html = 'test/fixtures/engine.html';
            var model = { foo: 'word up' };
            var expected = '<div ng-bind="foo">word up</div>';
            var actual = target.renderHtml(html, model);
            return actual.should.eventually.equal(expected);
        });
    });
});