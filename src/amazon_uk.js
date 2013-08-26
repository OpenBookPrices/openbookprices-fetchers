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

  // console.log("convert the isbn into ASIN");
  self.isbn2asin(function (err, asin) {
    if (err) { return cb(err); }
    // console.log("asin: %s", asin);

    var url = asin ? "http://www.amazon.co.uk/dp/" + asin : "http://www.amazon.co.uk/s?field-keywords=" + self.isbn;

    self.getOffers(asin, function (err, offers) {

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
    });
  });
};


Scraper.prototype.isbn2asin = function (cb) {
  var isbn = this.isbn;
  // console.log("isbn: %s", isbn);

  opHelper.execute(
    "ItemLookup",
    {
      // https://affiliate-program.amazon.com/gp/associates/help/t5/a16
      SearchIndex: "All",
      ItemId: isbn,
      IdType: "EAN",
    },
    function (error, results) {
      if (error) {
        return cb(error, null);
      }

      var items = results.ItemLookupResponse.Items[0].Item;
      if (!items) {
        return cb(null, null);
      }

      var asin = items[0].ASIN[0];
      return cb(null, asin);
    }
  );

};


Scraper.prototype.getOffers = function (asin, cb) {

  if (!asin) {
    return cb(null, []);
  }

  opHelper.execute(
    "ItemLookup",
    {
      // https://affiliate-program.amazon.com/gp/associates/help/t5/a16
      ItemId: asin,
      Condition: "All",
      ResponseGroup: "Offers",
      // ResponseGroup: "OfferSummary",
      MerchantId: "Amazon", // https://forums.aws.amazon.com/message.jspa?messageID=96815#
      // MerchantId: "A3P5ROKL5A1OLE", // https://forums.aws.amazon.com/message.jspa?messageID=96815#
    },
    function (error, results) {
      if (error) {
        return cb(error, null);
      }

      // console.log(JSON.stringify(results, null, 2));
      // console.log(results.ItemLookupResponse.Items[0].Item[0].OfferSummary);

      // _.each(['New','Used'], function (key) {
      //   console.log(key, results.ItemLookupResponse.Items[0].Item[0].OfferSummary[0]["Lowest" + key + "Price"]);
      // });

      if (! results.ItemLookupResponse.Items) {
        return cb(null, []);
      }

      var items = results.ItemLookupResponse.Items[0].Item[0];
      var offers = items.Offers[0].Offer;
      // console.log(offers);

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

      return cb(null, entries);
    }
  );
};
