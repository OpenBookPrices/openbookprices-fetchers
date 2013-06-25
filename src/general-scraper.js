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
      formats: {},
      updated: Math.floor(Date.now() / 1000),
    });


    // If the price is null then delete entire entry
    _.each(
      _.keys(entry.formats),
      function (format) {
        if (_.isNull(entry.formats[format].price)) {
          delete entry.formats[format];
        }
      }
    );

    // Default all the formats for the various conditions
    _.each(
      _.values(entry.formats),
      function (price) {
        _.defaults(price, {
          price: null,
          shipping: null,
          total: null,
          shippingNote: null,
          availabilityNote: null,
        });

        if (_.isNumber(price.price)) {
          price.total = price.price;
          if (_.isNumber(price.shipping)) {
            price.total += price.shipping;
          }
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
