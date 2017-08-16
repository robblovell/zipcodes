#!/usr/bin/env node

const fs = require('fs'),
    path = require('path'),
    zips = {},
    dataFree = fs.readFileSync('./free-zipcode-database.csv', 'utf8').replace(/\r/g, '').split('\n');
    dataGeo = fs.readFileSync('./GeoNamesData/US.txt', 'utf8').replace(/\r/g, '').split('\n');
let str;

dataFree.shift();

const clean = function(str) {
    return str.replace(/"/g, '').trimLeft();
};

const ucfirst = function(str) {
    str = str.toLowerCase();
    const lines = str.split(' ');
    lines.forEach(function(s, i) {
        const firstChar      = s.charAt(0),
            upperFirstChar = firstChar.toUpperCase();

        lines[i] = upperFirstChar + s.substring(1);
        
    });
    return lines.join(' ');
};

const addCityToZips = (zip, city) => {
    if (!zip.city) {
        zip.city = [];
    }
    if (zip.city.indexOf(city) === -1)
    {
        zip.city.push(city);
    }
    return zip.city
};

dataFree.forEach(function(line, num) {
    line = line.split(',');
    if (line.length > 1) {
        const o = { city: [] };
        const city = ucfirst(clean(line[3]));
        o.zip = clean(line[1]);
        if (!zips[o.zip]) {
            o.latitude = Number(clean(line[6]));
            o.longitude = Number(clean(line[7]));
            const city = ucfirst(clean(line[3]));
            o.state = clean(line[4]);
            o.city = addCityToZips(o.city, city);
            zips[o.zip] = o;
        } 
        else {
            zips[o.zip].city = addCityToZips(zips[o.zip], city);
        }
    }
});

dataGeo.forEach(function (line, num) {
    line = line.split('\t');
    if (line.length > 1) {
        const o = { city: [] };
        const city = ucfirst(clean(line[2]));
        o.zip = clean(line[1]);
        if (!zips[o.zip]) {
            o.latitude = Number(clean(line[9]));
            o.longitude = Number(clean(line[10]));
            o.state = clean(line[4]);
            o.city = addCityToZips(o.city, city);

            zips[o.zip] = o;
        }
        else {
            zips[o.zip].city = addCityToZips(zips[o.zip], city);
        }
    }
});


const stateMap = {};

for (const i in zips) {
    const item = zips[i];
    stateMap[item.state] = stateMap[item.state] || [];

    stateMap[item.state].push(item.zip);
}

str = 'exports.codes = ' + JSON.stringify(zips,null,2) + ';\n';
str += 'exports.stateMap = ' + JSON.stringify(stateMap,null,2) + ';\n';

fs.writeFileSync(path.join('../', 'lib', 'codes.js'), str, 'utf8');
