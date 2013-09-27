"use strict";

var AmazonScraper     = require("./amazon_generic"),
    shipping          = require("./amazon_uk_shipping"),
    config            = require("config");

config.setModuleDefaults("amazon_uk", {
  enabled: false,
});


var Scraper = module.exports = function (options) {
  this.init(options);
};


Scraper.prototype = new AmazonScraper();

Scraper.prototype.vendorCode = "amazon_uk";
Scraper.prototype.name       = "Amazon UK";
Scraper.prototype.homepage   = "http://www.amazon.co.uk/";

Scraper.prototype.countries  = shipping.countries;
Scraper.prototype.currencies = ["GBP"];
Scraper.prototype.defaultTTL = 3600;

Scraper.prototype.amazonEndpoint = "webservices.amazon.co.uk";
Scraper.prototype.superSaverNote = "Delivered FREE in the UK with Super Saver Delivery";
Scraper.prototype.shipping       = shipping;
