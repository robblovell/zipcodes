#!/usr/bin/env node

var path = require('path'),
    vows = require('vows'),
    assert = require('assert'),
    zipcodes = require(path.join(__dirname, '../', 'lib'));

var tests = {
    'null response': {
        topic: function() {
            return zipcodes.lookup("85281", "blah");
        },
        'returns null when zipcode not found': function(nothing) {
            assert.equal(nothing,null);
        }
    },
    'should export': {
        topic: function() {
            return zipcodes;
        },
        'a functions and objects': function(d) {
            ['lookup','lookupByName','distance','radius','toMiles','toKilometers'].forEach(function(key) {
                assert.isFunction(d[key]);
            });
            assert.isObject(d.codes);
            assert.isObject(d.states);
        }
    },
    'Marion': {
        topic: function() {
            return zipcodes.lookup(62959);
        },
        'should be ok': function(marion) {
            assert.equal(marion.city[0], 'Marion');
        }
    },
    'Carson': {
        topic: function() {
            return zipcodes.lookup(90810, 'Carson');
        },
        'should be ok': function(carson) {
            assert.equal(carson.city[0], 'Carson');
        }
    },
    'CarsonLowerCase': {
        topic: function() {
            return zipcodes.lookup(90810, 'carson');
        },
        'should be ok': function(carson) {
            assert.equal(carson.city[0], 'Carson');
        }
    },
    'CarsonUpperCase': {
        topic: function() {
            return zipcodes.lookup(90810, 'CARSON');
        },
        'should be ok': function(carson) {
            assert.equal(carson.city[0], 'Carson');
        }
    },
    'Kananaskis': {
      topic: function() {
        return zipcodes.lookup("T0L");
      },
      'should be ok': function(kananaskis) {
        assert.equal(kananaskis.city[0], "Kananaskis Country (claresholm)");
      }
    },
    'BC': {
        topic: function() {
          return zipcodes.lookup("V6B2Y9");
        },
        'should be ok': function(bc) {
          assert.equal(bc.state, "BC");
        }
    },
    'Beverly Hills': {
        topic: function() {
            return zipcodes.lookup(90210);
        },
        'should be ok': function(hills) {
            assert.equal(hills.city[0], 'Beverly Hills');
        }
    },
    'distance': {
        topic: function() {
            return null;
        },
        'should find': function() {
            var dist = zipcodes.distance(62959, 90210);
            assert.equal(dist, 1662);

            var dist2 = zipcodes.distance(62959, 62959);
            assert.equal(dist2, 0);

            var dist3 = zipcodes.distance(62959, 63801);
            assert.equal(dist3, 68);

            var dist4 = zipcodes.distance(62959, 95014);
            assert.equal(dist4, 1805);
            assert.equal(zipcodes.toKilometers(dist4), 2905);
            assert.equal(zipcodes.toMiles(zipcodes.toKilometers(dist4)), dist4);

            var dist5 = zipcodes.distance(62959, 90210);
            assert.equal(dist5, 1662);

            var dist6 = zipcodes.distance("T2E", "V5N");
            assert.equal(dist6, 419);

            var dist4 = zipcodes.distance(97703, "31422");
            assert.equal(dist4, 2322);

            var dist7 = zipcodes.distance('08512', '08512');
            assert.equal(dist7, 0);

            var dist8 = zipcodes.distance(62595, '62595');
            assert.equal(dist8, 0);

            var dist9 = zipcodes.distance('63005', '08512');
            assert.equal(dist9, 866);
        },
        'should not find': function() {
            var dist = zipcodes.distance(62959, 123456);
            assert.equal(dist, null);
            
            var dist2 = zipcodes.distance(123456, 62959);
            assert.equal(dist2, null);

            var dist3 = zipcodes.distance(123456, "V5N");
            assert.equal(dist3, null);

        }
    },
    'lookups': {
        topic: function() {
            return null;
        },
        'should find by name': function() {
            var l = zipcodes.lookupByName('Marion', 'il');
            assert.equal(l.length, 1);

            var l = zipcodes.lookupByName('Marion', 'Illinois');
            assert.equal(l.length, 1);

            var l = zipcodes.lookupByName('Cupertino', 'CA');
            assert.equal(l.length, 2);

            var l = zipcodes.lookupByName('New York', 'New York');
            assert.equal(l.length, 165);

            var l = zipcodes.lookupByName('New York', 'NY');
            assert.equal(l.length, 165);
        },
        'should find by state': function() {
            var l = zipcodes.lookupByState('RI');
            assert.equal(l.length, 91);

            var l = zipcodes.lookupByState('ri');
            assert.equal(l.length, 91);

            var l = zipcodes.lookupByState('foobar');
            assert.equal(l.length, 0);

        }
    },
    'radius': {
        topic: function() {
            return null;
        },
        'should find': function() {
            var rad = zipcodes.radius(62959, 20);
            assert.equal(rad.length, 38);

            var rad = zipcodes.radius(95014, 50);
            assert.equal(rad.length, 387);
            
            var rad = zipcodes.radius(95014, 50, true);
            assert.equal(rad.length, 387);
            assert.deepEqual(rad[0], {
                zip: '93901',
                latitude: 36.6677,
                longitude: -121.6596,
                city: ['Salinas'],
                state: 'CA'
            });
        }
    },
    'NMFCLookups': {
        topic: function () {
            return null;
        },
        'should find by nmfc': function () {
            const l = zipcodes.nmfcLookup('186590');
            assert.equal(l.classCode, "85.00");
            assert.equal(l.description, "Electric hand held Power Tools, or parts");
            assert.equal(l.item, "Tools");
            assert.equal(l.nmfc, "186590");
            assert.equal(l.sub, " ");

        },
        'should return null for non nmfc': function () {
            const l = zipcodes.nmfcLookup('11111');
            assert.equal(l,null);
        }
    }
};

vows.describe('zipcodes').addBatch(tests).export(module);
