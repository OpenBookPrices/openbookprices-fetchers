'use strict';

var util    = require('util'),
    _       = require('underscore'),
    jsdom   = require('jsdom'),
    fs      = require('fs'),
    request = require('request'),
    ean     = require('ean');

var defaultTTL = 86400;

var scraper = function () {
  
};

scraper.prototype.init = function (options) {
  _.extend(this, options);
  
  var isbn = this.isbn;

  // Check that we have the values we need
  if (!isbn) {
    throw new Error('Need an isbn');
  }

  if (!ean.isValid(isbn)) {
    throw new Error('Not a valid ISBN13 "' + this.isbn + '"');
  }

  this.isbn = isbn;

  this.results = {
    isbn: isbn
  };
};



scraper.prototype.cleanup = function (results) {
  var self = this;

  if (!results.found) {

    results.prices = [];

    _.each(self.countries, function (country) {
      _.each(self.currencies, function (currency) {
        results.prices.push({
          country: country,
          currency: currency,
          availability: false,
          availabilityComment: 'Not found',
        });
      });
    });
  }


  _.each(results, function (val, key) {
    if (_.isString(val)) {
      val = val.replace(/\s+/, ' ');
      results[key] = val.trim();
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
