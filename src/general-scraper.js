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
    entries: [],
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

  _.each(results.entries, function (entry) {

    // Initial defaults
    _.defaults(entry, {
      ttl:    self.defaultTTL || defaultTTL,
      url:    results.url,
      offers: {},
      timestamp: Math.floor(Date.now() / 1000),
    });

    var checkNumber = function (number) {
      return _.isNumber(number) && !_.isNaN(number);
    };

    // If the price is null then delete entire entry
    _.each(
      entry.offers,
      function (offer, condition) {
        // price must be a real number
        if (!checkNumber(offer.price)) {
          delete entry.offers[condition];
        }
      }
    );

    // Default all the offers for the various conditions
    _.each(
      entry.offers,
      function (offer, condition) {
        _.defaults(offer, {
          shipping: 0,
          shippingNote: null,
          availabilityNote: null,
          url: entry.url,
        });

        offer.condition = condition;
        offer.total = offer.price;

        if (checkNumber(offer.shipping)) {
          offer.total += offer.shipping;
        }

      }
    );

    // Set regardless to ensure that they are correct
    entry.isbn   = self.isbn;
    entry.vendor = self.vendorCode;

  });

  return results;
};

module.exports = scraper;
