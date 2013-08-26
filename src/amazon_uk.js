"use strict";

var GeneralScraper     = require("./general-scraper"),
    _                  = require("underscore"),
    OperationHelper    = require("apac").OperationHelper,
    config             = require("config");

var Scraper = module.exports = function (options) {
  this.init(options);
};

Scraper.prototype = new GeneralScraper();

Scraper.prototype.vendorCode = "amazon_uk";
Scraper.prototype.countries  = ["GB"];
Scraper.prototype.currencies = ["GBP"];
Scraper.prototype.defaultTTL = 3600;

var opHelper = new OperationHelper({
  awsId:     config[Scraper.prototype.vendorCode].awsId,
  awsSecret: config[Scraper.prototype.vendorCode].awsSecret,
  assocId:   config[Scraper.prototype.vendorCode].assocId,

  // http://docs.aws.amazon.com/AWSECommerceService/latest/DG/SOAPEndpoints.html
  endPoint:  "webservices.amazon.co.uk",
});

Scraper.prototype.scrape = function (cb) {
  var self = this;
  var entries = this.results.entries = [];

  opHelper.execute(
    "ItemLookup",
    {
      ItemId: self.isbn,
      IdType: "EAN",
      SearchIndex: "Books",
      Condition: "All",
      ResponseGroup: "Offers",
      MerchantId: "Amazon", // https://forums.aws.amazon.com/message.jspa?messageID=96815#
    },
    function (error, apaResults) {
      if (error) {
        return cb(error, null);
      }

      // console.log(JSON.stringify(apaResults, null, 2));
      var asin   = self.extractASIN(apaResults);
      var offers = self.extractOffers(apaResults);

      var url = asin ? "http://www.amazon.co.uk/dp/" + asin : "http://www.amazon.co.uk/s?field-keywords=" + self.isbn;

      var basePrice = {
        currency:  "GBP",
      };

      var formats = {};
      _.each(offers, function (offer) {
        formats[offer.condition] = _.omit(offer, "condition");
      });

      entries.push(_.extend({}, basePrice, {
        countries: ["GB"],
        url: url,
        formats: formats,
      }));

      self.cleanup(self.results);

      cb(null, self.results);
    }
  );
};


Scraper.prototype.checkHaveResults = function (apaResults) {

  if (apaResults.ItemLookupResponse.Items[0].Item) {
    return true;
  }

  return false;
  
};


Scraper.prototype.extractOffers = function (apaResults) {

  if (! this.checkHaveResults(apaResults)) {
    return [];
  }

  var item   = apaResults.ItemLookupResponse.Items[0].Item[0];
  var offers = item.Offers[0].Offer;


  var entries = [];

  _.each(offers, function (offer) {

    var entry = {};

    entry.condition = offer.OfferAttributes[0].Condition[0].toLowerCase();

    var listing = offer.OfferListing[0];
    entry.price    = listing.Price[0].Amount[0] / 100;
    entry.availabilityNote = listing.Availability[0];

    // console.log(listing);
    var isSuperSaver = !! parseInt(listing.IsEligibleForSuperSaverShipping[0], 10);
    if (isSuperSaver) {
      entry.shipping = 0;
      entry.shippingNote = "Delivered FREE in the UK with Super Saver Delivery";
    } else {
      entry.shipping = 0.59 + 2.16; // http://www.amazon.co.uk/gp/help/customer/display.html?nodeId=10790441#first
      entry.shippingNote = "First Class delivery";
    }

    // console.log(entry);
    entries.push(entry);
  });

  return entries;
};


Scraper.prototype.extractASIN = function (apaResults) {

  if (! this.checkHaveResults(apaResults)) {
    return null;
  }

  var item   = apaResults.ItemLookupResponse.Items[0].Item[0];
  var asin   = item.ASIN[0];
  return asin;
};
