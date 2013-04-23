"use strict";

var _ = require("underscore");

var Fetcher = function () {

};

var scrapers = Fetcher.prototype.scrapers = {
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


Fetcher.prototype.vendorsForCountry = function (country) {
  return countryToVendors[country] || [];
};


Fetcher.prototype.fetch = function (options, cb) {

  var scraperName = options.vendor;
  var Scraper     = this.scrapers[scraperName];

  if (!Scraper) {
    return cb(new Error("Scraper for " + scraperName + " not found"));
  }

  // Run the scraper
  new Scraper(options).scrape(cb);
};


module.exports = Fetcher;
