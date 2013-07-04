"use strict";

var assert         = require("assert"),
    fetcher        = require(".."),
    _              = require("underscore");


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

  describe("currencies", function () {

    it("should return default currency", function () {
      assert.equal(
        fetcher.currencyForVendor("foyles"),
        "GBP"
      );
    });

    it("should return same currency if supported", function () {
      assert.equal(
        fetcher.currencyForVendor("foyles", "GBP"),
        "GBP"
      );
    });

    it("should return default currency if not supported", function () {
      assert.equal(
        fetcher.currencyForVendor("foyles", "SEK"),
        "GBP"
      );
    });
  });

});
