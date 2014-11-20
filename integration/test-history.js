/*global describe, it*/
'use strict';

var _ = require('lodash')
  , chai = require('chai')
  , chaiAsPromised = require("chai-as-promised")
  , rsvp = require('rsvp')
  ;

chai.use(chaiAsPromised);

var all = rsvp.all
  , expect = chai.expect
  , st2api = require('../index')()
  ;

var MINIMUM_ENTITIES = 3;

describe('History', function () {
  describe('#list()', function () {
    it('should return a promise of a list of history records', function () {
      var result = st2api.history.list();

      return all([
        expect(result).to.be.fulfilled,
        expect(result).to.eventually.be.an('array'),
        // 'length.of.at.least' is broken when used along with 'evantually'
        //expect(result).to.eventually.have.length.of.at.least(100)
        result.then(function (records) {
          expect(records).to.have.length.of.at.least(MINIMUM_ENTITIES);
        })
      ]);
    });

    it('should set total count of elements', function () {
      var result = st2api.history.list();

      return result.then(function () {
        expect(st2api.history).to.have.property('total');
        expect(st2api.history.total).to.be.a('number');
        expect(st2api.history.total).to.be.at.least(MINIMUM_ENTITIES);
      });
    });

    it('should limit the list', function () {
      var LIMIT = 10;

      var result = st2api.history.list({
        limit: _.clone(LIMIT)
      });

      return all([
        expect(result).to.be.fulfilled,
        expect(result).to.eventually.be.an('array'),
        result.then(function (records) {
          expect(records).to.have.length.within(MINIMUM_ENTITIES, LIMIT);
          expect(st2api.history.limit).to.be.within(MINIMUM_ENTITIES, LIMIT);
        })
      ]);
    });

    it('should paginate through the list', function () {
      var LIMIT = 10
        , OFFSET = 10;

      var result = st2api.history.list({
        limit: _.clone(LIMIT),
        offset: _.clone(OFFSET)
      });

      return all([
        expect(result).to.be.fulfilled,
        expect(result).to.eventually.be.an('array'),
        result.then(function (records) {
          expect(records).to.have.length.within(0, LIMIT);
          // What else? How do we determine we got another set of history here?
        })
      ]);
    });
  });

  describe('#get()', function () {
    it('should return a promise of a single action', function () {
      var result = st2api.history.list({
        limit: 1
      }).then(function (records) {
        return st2api.history.get(records[0].id);
      });

      return all([
        expect(result).to.be.fulfilled,
        expect(result).to.eventually.be.an('object')
        // TODO: consider checking against jsonschema
      ]);
    });
  });
});