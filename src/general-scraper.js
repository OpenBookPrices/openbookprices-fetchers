"use strict";

var _       = require("underscore"),
    ean     = require("ean");

var defaultTTL = 86400;

var scraper = function () {

};

scraper.prototype.init = function (args) {
  args = args || {};

  // Check that we have the values we need
  if (!args.isbn) {
    throw new Error("Need an isbn");
  } else if (!ean.isValid(args.isbn)) {
    throw new Error("Not a valid ISBN13 '" + args.isbn + "'");
  }

  // Check that we have the values we need
  if (!args.country) {
    throw new Error("Need a country");
  } else if (!_.contains(this.countries, args.country)) {
    throw new Error("Not a supported country: '" + args.country + "'");
  }

  // Check that we have the values we need
  if (!args.currency) {
    throw new Error("Need a currency");
  } else if (!_.contains(this.currencies, args.currency)) {
    throw new Error("Not a supported currency: '" + args.currency + "'");
  }

  _.extend(this, args);

  this.results = {
    args: args,
  };
};



scraper.prototype.cleanup = function (results) {
  var self = this;

  _.defaults(results, {
    prices: [],
  });

  _.each(results, function (val, key) {
    if (_.isString(val)) {
      val = val.replace(/\s+/, " ");
      results[key] = val.trim();
    }
  });

  // strip all keys starting with underscore
  _.each(results, function (val, key) {
    if ((/^_/).test(key)) {
      delete results[key];
    }
  });

  _.each(results.prices, function (price) {

    // Initial defaults
    _.defaults(price, {
      amount:   false,
      shipping: false,
      total:    false,
      ttl:      self.defaultTTL || defaultTTL,
      url:      results.url,
    });

    // Defaults that depend on other values
    _.defaults(price, {
      validUntil: Math.floor(results._startTime / 1000 + price.ttl)
    });

    if (_.isNumber(price.amount) && _.isNumber(price.shipping)) {
      price.total = price.amount + price.shipping;
    }

    price.availability = self.parseAvailability(price);

    // Set regardless to ensure that they are correct
    price.isbn   = self.isbn;
    price.vendor = self.vendorCode;

  });

  return results;
};

scraper.prototype.parseAvailability = function (price) {

  var tester = function (regex) {
    return regex.test(price.availabilityComment);
  };

  var yesTests = this.availabilityTests.yes;
  var noTests  = this.availabilityTests.no;

  if (_.any(yesTests, tester)) { return true;  }
  if (_.any(noTests,  tester)) { return false; }

  return null;
};

module.exports = scraper;
