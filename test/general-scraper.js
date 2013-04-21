"use strict";

var assert         = require("assert"),
    GeneralScraper = require("../src/general-scraper"),
    _              = require("underscore");

var TestScraper = function (options) {
  this.init(options);
};
TestScraper.prototype = new GeneralScraper();

TestScraper.prototype.vendorCode = "test-scraper";
TestScraper.prototype.countries  = ["GB", "US"];
TestScraper.prototype.currencies = ["GBP", "USD"];


describe("GeneralScraper", function () {
  describe("#constructor()", function () {

    var goodArgs = {
      isbn: "9784873113364",
      country: "GB",
      currency: "GBP",
    };

    it("should validate ISBN", function () {

      // golden path
      assert.ok(
        new TestScraper(goodArgs)
      );

      // Test various missing bits
      assert.throws(
        function () { new TestScraper(); },
        /Need an isbn/
      );
      assert.throws(
        function () { new TestScraper(_.omit(goodArgs, "isbn")); },
        /Need an isbn/
      );

      var badISBNs = {
        "foo"               : new RegExp("Not a valid ISBN13 'foo'"),
        "978-4-87311-336-4" : new RegExp("Not a valid ISBN13 '978-4-87311-336-4'"),
        "9784873113360"     : new RegExp("Not a valid ISBN13 '9784873113360'"),
        "4873113369"        : new RegExp("Not a valid ISBN13 '4873113369'"),
      };

      // bad configs throw
      _.each(
        badISBNs,
        function (regex, badISBN) {
          assert.throws(
            function () {
              new TestScraper(_.extend({}, goodArgs, {isbn: badISBN}));
            },
            regex
          );
        }
      );

    });

    it("should validate country", function () {
      assert.throws(
        function () { new TestScraper(_.omit(goodArgs, "country")); },
        /Need a country/
      );
      assert.throws(
        function () { new TestScraper(_.extend({}, goodArgs, {country: "SE"})); },
        /Not a supported country: 'SE'/
      );
    });

    it("should validate currency", function () {
      assert.throws(
        function () { new TestScraper(_.omit(goodArgs, "currency")); },
        /Need a currency/
      );
      assert.throws(
        function () { new TestScraper(_.extend({}, goodArgs, {currency: "SEK"})); },
        /Not a supported currency: 'SEK'/
      );


    });
  });
});
