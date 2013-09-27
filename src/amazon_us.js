"use strict";

var AmazonScraper     = require("./amazon_generic"),
    shipping          = require("./amazon_us_shipping"),
    config            = require("config");

config.setModuleDefaults("amazon_us", {
  enabled: false,
});


var Scraper = module.exports = function (options) {
  this.init(options);
};


Scraper.prototype = new AmazonScraper();

Scraper.prototype.vendorCode = "amazon_us";
Scraper.prototype.name       = "Amazon USA";
Scraper.prototype.homepage   = "http://www.amazon.com/";

Scraper.prototype.countries  = shipping.countries;
Scraper.prototype.currencies = ["USD"];
Scraper.prototype.defaultTTL = 3600;

Scraper.prototype.amazonEndpoint = "webservices.amazon.com";
Scraper.prototype.superSaverNote = "FREE Super Saver Shipping";
Scraper.prototype.shipping       = shipping;
