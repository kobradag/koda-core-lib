"use strict";

var should = require('chai').should();
var kobracore = require('../');

describe('#versionGuard', function() {
  it('global._kobracoreLibVersion should be defined', function() {
    should.equal(global._kobracoreLibVersion, kobracore.version);
  });

  it('throw an error if version is already defined', function() {
    (function() {
      kobracore.versionGuard('version');
    }).should.throw('More than one instance of bitcore');
  });
});
