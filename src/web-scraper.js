'use strict';

var util    = require('util'),
    _       = require('underscore'),
    jsdom   = require('jsdom'),
    fs      = require('fs'),
    request = require('request'),
    ean     = require('ean');

var jquerySource  = fs.readFileSync(__dirname + '/../lib/jquery.js').toString();

var scraper = function () {
  
};

scraper.prototype.init = function (options) {
  _.extend(this, options);
  
  var isbn = this.isbn;

  // Check that we have the values we need
  if (!isbn) {
    throw new Error('Need an isbn');
  }

  // Clean up the ISBN number
  isbn = isbn.replace(/\D/g, '');

  // isbn10 to isbn13 - see http://www.isbn-13.info/ for algorithm
  if (isbn.length == 10) {
    isbn = '978' + isbn.substr(0, 9);
    isbn += ean.checksum(isbn.split(''));
  }

  if (!ean.isValid(isbn)) {
    throw new Error('Not a valid ISBN "' + this.isbn + '"');
  }

  this.isbn = isbn;

  this.results = {};
};

scraper.prototype.get = function (url, cb) {
  var results = this.results;
  results.startTime = Date.now();

  // to keep jshint happy
  var httpProxy = 'http_proxy';

  request(
    {
      url: url,
      proxy: process.env[httpProxy],
    },
    function (error, response, body) {

      if (error) {
        return cb(error);
      }
      
      results.url = response.request.uri.href;
      
      jsdom.env({
        html: body,
        src: [ jquerySource ],
        done: function (errors, window) {
          cb(errors, window);
        }
      });
    }
  );
};

scraper.prototype.scrape = function (cb) {
  var self    = this;
  var results = this.results;

  var url  = util.format(this.isbnURLTemplate, this.isbn);

  this.get(
    url,
    function (errors, window) {
      if (errors) {
        throw errors;
      }
      
      var $ = window.$;
      _.extend(results, self.jqueryExtract($));


      results.endTime = Date.now();
      results.totalTime = results.endTime - results.startTime;

      self.cleanup(results);


      cb(null, self.results);

    }
  );
  
};


scraper.prototype.cleanup = function (results) {
  var self = this;

  if (!results.found) {

    results.prices = [];

    _.each( self.countries, function (country) {
      _.each( self.currencies, function (currency) {
        results.prices.push({
          country: country,
          currency: currency,
          availability: false,
          availabilityComment: "Not found",
        })
      })
    });
  }


  _.each(results, function (val, key) {
    if (_.isString(val)) {
      val = val.replace(/\s+/, ' ');
      results[key] = val.trim();
    }
  });
  
  _.each(results.prices, function (price) {
    _.defaults(price, {
      amount:   false,
      shipping: false,
      total:    false,
    });
    if (_.isNumber(price.amount) && _.isNumber(price.shipping)) {
      price.total = price.amount + price.shipping;
    }
    price.availability = self.parseAvailability(price);
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