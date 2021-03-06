const codesUS = require('./codes'),
    states = require('./states'),
    codesCanada = require('./codesCanada'),
    NMFCProductCodes = require('./NMFCCodes');

const codes = {}
codes.codes = Object.assign({}, codesUS.codes, codesCanada.codes);
codes.stateMap = Object.assign({}, codesUS.stateMap, codesCanada.stateMap);
codes.NMFCCodes = Object.assign({}, NMFCProductCodes.NMFCCodes);
exports.states = states;
exports.codes = codes.codes;

const lookup = function(zip, city=null) {
    var zipCodeObject;

    if (zip !== null && zip !== undefined && typeof zip === "string" && isNaN(zip.charAt(0))) {
        zipCodeObject = codes.codes[zip.slice(0, 3)];
    }
    else {
         zipCodeObject = codes.codes[zip];
    }

    if(zipCodeObject == undefined) {
        return zipCodeObject;
    }

    if(city == null)
    {
        return zipCodeObject;
    }
    else
    {
        city = upperCaseFirstCharacter(city.toLowerCase());
        if(zipCodeObject.city.indexOf(city) != -1)
        {
            cities = [city, ...(zipCodeObject.city.filter((c) => { return c !== city; }))];
            zipCodeObject.city = cities;
            return zipCodeObject;
        }
        else {
            return null;
        }
    }
};

exports.lookup = lookup;

var upperCaseFirstCharacter = function(str) {
    str = str.toLowerCase();
    var lines = str.split(' ');
    lines.forEach(function(s, i) {
        var firstChar      = s.charAt(0),
            upperFirstChar = firstChar.toUpperCase();

        lines[i] = upperFirstChar + s.substring(1);

    });
    return lines.join(' ');
};


var byName = function(city, state) {
    city = city.toUpperCase();

    var ret = [];
    
    byState(state).forEach(function(item) {
        for(var i =0; i< item.city.length; i++) {
            if (city === item.city[i].toUpperCase()) {
                ret.push(item);
            }
        }
    });

    return ret;
}

exports.lookupByName = byName;

const byState = function(state) {
    state = states.normalize(state.toUpperCase());

    var ret = [];

    if(!codes.stateMap[state]){
        return ret;
    }
    
    codes.stateMap[state].forEach(function(zip) {
        ret.push(codes.codes[zip]);
    });

    return ret;
}

exports.lookupByState = byState;

const dist = function(zipA, zipB) {

    if (zipB.toString() === zipA.toString()) {
      return 0
    }
    zipA = lookup(""+zipA);
    zipB = lookup(""+zipB);
    if (!zipA || !zipB) {
        return null;
    }

    var zipALatitudeRadians = deg2rad(zipA.latitude);
    var zipBLatitudeRadians = deg2rad(zipB.latitude);

    var distance = Math.sin(zipALatitudeRadians) 
                * Math.sin(zipBLatitudeRadians) 
                + Math.cos(zipALatitudeRadians) 
                * Math.cos(zipBLatitudeRadians) 
                * Math.cos(deg2rad(zipA.longitude - zipB.longitude)); 

    distance = Math.acos(distance) * 3958.56540656;
    return Math.round(distance);
};

exports.distance = dist;


//This is SLLOOOOWWWWW
exports.radius = function(zip, miles, full) {
    var ret = [], i, d;
    
    for (i in codes.codes) {
        if (dist(zip, i) <= miles) {
            ret.push(((full) ? codes.codes[i] : i));
        }
    }
    return ret;
};


const deg2rad = function(value) {
    return value * 0.017453292519943295;
}

exports.toMiles = function(kilos) {
    return Math.round(kilos / 1.609344);
};

exports.toKilometers = function(miles) {
    return Math.round(miles * 1.609344);
};

const nmfcLookup = function (nmfc) {
    NMFCCode = codes.NMFCCodes[nmfc];
    if (NMFCCode) {
        return NMFCCode;
    } else {
        return null;
    }
};

exports.nmfcLookup = nmfcLookup;
