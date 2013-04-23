"use strict";

var assert         = require("assert"),
    Fetcher        = require(".."),
    _              = require("underscore");

var fetcher = new Fetcher();

describe("Fetcher", function () {
  describe("scrapers by country", function () {

    it("should return foyles for GB", function () {
      var vendors = fetcher.vendorsForCountry("GB");
      assert(_.contains(vendors, "foyles"));
    });

    it("should return [] for XX", function () {
      var vendors = fetcher.vendorsForCountry("XX");
      assert.deepEqual(vendors, []);
    });

  });
});
