/**
 * Author: Jeff Whelpley
 * Date: 3/5/15
 *
 * This is for the command line tool with jangular
 */
var prettier    = require('html');
var commander   = require('commander');
var directives  = require('./jangular.directives');
var engine      = require('./jangular.engine');

// load all the angular directives
directives.init();

// initialize commander
commander
    .version('0.0.1')
    .option('-t, --tpl [templateFilePath|template]', 'Path to the HTML file or actual template')
    .option('-d, --data [dataFilePath|data]', 'Path to JSON object or actual JSON object for the model')
    .option('-s, --strip', 'This will strip out all angular markup from template')
    .parse(process.argv);

// get params
var template = commander.tpl;
var data = commander.data;
var opts = { strip: commander.strip };

engine.renderHtml(template, data, opts)
    .then(function (renderedHtml) {
        var prettyHtml = prettier.prettyPrint(renderedHtml, { 'indent_size': 2 });
        console.log(prettyHtml);
    });
