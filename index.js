#!/usr/bin/env node

var map = require('map-stream');
var fs = require('vinyl-fs');
var argv = require('yargs')
    .usage("Usage: $0 --workspace ~/.bonita/widgets --grab properties [--display item.name] [--filter item.bidirectional==true]")

    .demand('workspace')
    .alias('workspace', 'w')

    .demand('grab')
    .alias('grab', 'g')

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

fs.src(argv.workspace + '/**/*.json')
    .pipe(map(function (file, callback) {
        var artifact = JSON.parse(file.contents);
        console.log(
            artifact.name, '=>',
            (displays[typeOf(artifact[argv.grab])] || ((any) => any))(artifact[argv.grab]));
        callback(null, file);
    }));
