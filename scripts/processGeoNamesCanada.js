#!/usr/bin/env node
var fs = require('fs'),
    path = require('path'),
    zips = {}, str,
    data = fs.readFileSync('./GeoNamesData/CA.txt', 'utf8').replace(/\r/g, '').split('\n');

var clean = function (str) {
    return str.replace(/"/g, '').trimLeft();
}

var ucfirst = function (str) {
    str = str.toLowerCase();
    var lines = str.split(' ');
    lines.forEach(function (s, i) {
        var firstChar = s.charAt(0),
            upperFirstChar = firstChar.toUpperCase();

        lines[i] = upperFirstChar + s.substring(1);

    });
    return lines.join(' ');
};

data.forEach(function (line, num) {

    var o = {city: []};
    var city = null;
    line = line.split('\t');
    if (line.length > 1) {
        o.zip = clean(line[1]);
        city = ucfirst(clean(line[2]));
        if (!zips[o.zip]) {
            o.latitude = Number(clean(line[9]));
            o.longitude = Number(clean(line[10]));
            o.city.push(city);
            o.state = clean(line[4]);
            zips[o.zip] = o;
        }
        else {
            zips[o.zip].city.push(city);
        }
    }
});

var stateMap = {};

for (var i in zips) {
    var item = zips[i];
    stateMap[item.state] = stateMap[item.state] || [];

    stateMap[item.state].push(item.zip);
}

str = 'exports.codes = ' + JSON.stringify(zips) + ';\n';
str += 'exports.stateMap = ' + JSON.stringify(stateMap) + ';\n';

fs.writeFileSync(path.join('../', 'lib', 'codesCanada.js'), str, 'utf8');
