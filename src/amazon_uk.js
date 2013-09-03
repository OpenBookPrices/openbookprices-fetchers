"use strict";

var GeneralScraper     = require("./general-scraper"),
    _                  = require("underscore"),
    OperationHelper    = require("apac").OperationHelper,
    config             = require("config"),
    shipping           = require("./amazon_uk_shipping");

config.setModuleDefaults("amazon_uk", {
  // disabled by default as scraper requires auth tokens
  disabled:  true,
  awsId:     null,
  awsSecret: null,
  assocId:   null,
});

var Scraper = module.exports = function (options) {
  this.init(options);
};

Scraper.prototype = new GeneralScraper();

Scraper.prototype.vendorCode = "amazon_uk";
Scraper.prototype.name       = "Amazon UK";
Scraper.prototype.homepage   = "http://www.amazon.co.uk/";

Scraper.prototype.countries  = shipping.countries;
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


      _.each(shipping.blocks, function (block) {

        var formats = {};
        _.each(offers, function (offer) {

          var format = _.omit(offer, "condition", "isSuperSaver");

          if (offer.isSuperSaver && block.superSaverPermitted) {
            format.shipping = 0;
            format.shippingNote = "Delivered FREE in the UK with Super Saver Delivery";
          } else {
            format.shippingNote = block.note;
            format.shipping     = block.amount;
          }

          formats[offer.condition] = format;
        });

        entries.push(_.extend({}, basePrice, {
          countries: block.countries,
          url: url,
          formats: formats,
        }));
      });


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
    entry.isSuperSaver = !! parseInt(listing.IsEligibleForSuperSaverShipping[0], 10);

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
