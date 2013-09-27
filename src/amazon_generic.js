"use strict";

var GeneralScraper     = require("./general-scraper"),
    _                  = require("underscore"),
    OperationHelper    = require("apac").OperationHelper,
    config             = require("config");

config.setModuleDefaults("amazon", {
  awsId:     null,
  awsSecret: null,
  assocId:   null,
});

var Scraper = module.exports = function () {};

Scraper.prototype = new GeneralScraper();


Scraper.prototype.scrape = function (cb) {
  var self = this;
  var entries = this.results.entries = [];

  var opHelper = new OperationHelper({
    awsId:     config.amazon.awsId,
    awsSecret: config.amazon.awsSecret,
    assocId:   config.amazon.assocId,

    // http://docs.aws.amazon.com/AWSECommerceService/latest/DG/SOAPEndpoints.html
    endPoint:  self.amazonEndpoint,
  });

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
      var asin    = self.extractASIN(apaResults);
      var results = self.extractOffers(apaResults);

      var base = self.homepage;
      var url = asin ? base + "dp/" + asin : base + "s?field-keywords=" + self.isbn;

      var basePrice = {
        currency:  self.currencies[0],
      };


      _.each(self.shipping.blocks, function (block) {

        var offers = {};
        _.each(results, function (result) {

          var format = _.omit(result, "condition", "isSuperSaver");

          if (result.isSuperSaver && block.superSaverPermitted) {
            format.shipping = 0;
            format.shippingNote = self.superSaverNote;
          } else {
            format.shippingNote = block.note;
            format.shipping     = block.amount;
          }

          offers[result.condition] = format;
        });

        entries.push(_.extend({}, basePrice, {
          countries: block.countries,
          url: url,
          offers: offers,
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
