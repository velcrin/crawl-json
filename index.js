#!/usr/bin/env node

var map = require('map-stream');
var fs = require('vinyl-fs');
var argv = require('yargs')
    .usage("Usage: $0 --json '~/.bonita/widgets/**/*.json' --grab properties [--display item.name] [--filter item.bidirectional==true]")

    .demand('json')
    .alias('json', 'j')

    .demand('grab')
    .alias('grab', 'g')

    .demand('identifier', false)
    .default('identifier', 'name')
    .alias('identifier', 'id')

    .demand('display', false)
    .default('display', 'item')

    .demand('filter', false)
    .default('filter', true)

    .help('help')
    .argv;

var displays = {
    '[object Object]': (object) => new Function('item', 'return ' + argv.display + ';').call(null, object),
    '[object Array]': (array) => array
        .filter(new Function('item', 'return ' + argv.filter + ';'))
        .map(new Function('item', 'return ' + argv.display + ';'))
};

function typeOf(any) {
    return Object.prototype.toString.call(any);
}

fs.src(argv.json)
    .pipe(map(function (file, callback) {
        var artifact = JSON.parse(file.contents);
        console.log(
            artifact[argv.identifier], '=>',
            (displays[typeOf(artifact[argv.grab])] || ((any) => any))(artifact[argv.grab]));
        callback(null, file);
    }));
