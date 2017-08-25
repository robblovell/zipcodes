#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const NMFCCodes = {};
const data = fs.readFileSync('./NMFCCodeLookup.txt', 'utf8').split('\r');

const fixClassCode = (code) => {
    return (code.indexOf(".") == -1) ? code+".00" : code+"0"
};

const fixNMFC = (nmfc) => {
    return ("000000" + nmfc).substr(-6,6);
};

data.forEach((line, num) => {
    line = line.split('\t');
    if (line.length > 1) {
        NMFCCodes[line[3]] = {
            item: line[0],
            description: line[1].replace(/\"/g,""),
            classCode: fixClassCode(line[2]),
            nmfc: fixNMFC(line[3]),
            sub: line[4]
        }
    }
});

const str = 'exports.NMFCCodes = ' + JSON.stringify(NMFCCodes, null, 2) + ';\n';

fs.writeFileSync(path.join('../', 'lib', 'NMFCCodes.js'), str, 'utf8');
