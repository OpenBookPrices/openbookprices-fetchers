"use strict";

var _            = require("underscore"),
    config       = require("config");

var Fetcher = function () {

};

var knownScrapers = [
  "amazon_uk",
  "foyles",
];

var scrapers = {};

_.each(knownScrapers, function (code) {
  var scraper = require("./src/" + code);
  if (config[code] && config[code].disabled) {
    // scraper disabled, don't add to the list
    // console.log("Not loading disabled scraper '%s'", code);
  } else {
    scrapers[code] = scraper;
  }
});



var countryToVendors = {};
_.each(scrapers, function (Scraper, vendor) {
  // var scraper = new Scraper();
  _.each(Scraper.prototype.countries, function (country) {
    countryToVendors[country] = countryToVendors[country] || [];
    countryToVendors[country].push(vendor);
  });
});


Fetcher.getScraper = function (code) {
  return scrapers[code];
};

Fetcher.vendorsForCountry = function (country) {
  return countryToVendors[country] || [];
};


Fetcher.countryForVendor = function (scraperName) {

  var Scraper = scrapers[scraperName];
  if (!Scraper) {
    throw new Error("scraper '" + scraperName + "' not found");
  }

  return Scraper.prototype.countries[0];
};


Fetcher.currencyForVendor = function (scraperName, optionalCurrency) {
  if (!optionalCurrency) {
    optionalCurrency = "";
  }

  var Scraper = scrapers[scraperName];
  if (!Scraper) {
    throw new Error("scraper '" + scraperName + "' not found");
  }

  var currencies = Scraper.prototype.currencies;

  if (_.contains(currencies, optionalCurrency)) {
    return optionalCurrency;
  } else {
    return currencies[0];
  }

};


Fetcher.allVendorCodes = function () {
  return _.keys(scrapers);
};

Fetcher.vendorCodes = function () {
  return _.keys(scrapers);
};


Fetcher.fetch = function (options, cb) {

  var scraperName = options.vendor;
  var Scraper     = scrapers[scraperName];

  if (!Scraper) {
    return cb(new Error("Scraper for " + scraperName + " not found"));
  }

  // Run the scraper
  new Scraper(options).scrape(cb);
};


module.exports = Fetcher;
