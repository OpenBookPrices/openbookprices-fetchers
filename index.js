"use strict";

var _ = require("underscore");

var Fetcher = function () {

};

var scrapers = {
  foyles: require("./src/foyles"),
};


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
