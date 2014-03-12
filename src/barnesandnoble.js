'use strict';

var WebScraper = require('./web-scraper'),
    _          = require('underscore'),
    config     = require('config'),
    countries  = require('country-data').countries;

config.setModuleDefaults('barnesandnoble', {
  enabled: true,
});


var restOfWorld = _.chain(countries.all)
  .where({status: 'assigned'})
  .pluck('alpha2')
  .without('US', 'CA')
  .value();

// http://www.barnesandnoble.com/help/po_shipping_options.asp
var regions = {
  usa: {
    countries: ['US'],
    shipping: 3.00 + 0.99,
    shippingNote: '3-7 business days',
    freeShippingAppliesAt: 25,
  },
  canada: {
    countries: ['CA'],
    shipping: 3.99 + 2.49,
    shippingNote: '6-12 business days',
  },
  restOfWorld: {
    countries: restOfWorld,
    shipping: 7.49 + 5.49,
    shippingNote: '8-22 business days',
  },
};

var allCountries = _.chain(regions).values().pluck('countries').flatten().value();

var Scraper = module.exports = function (options) {
  this.init(options);
};

Scraper.prototype = new WebScraper();

Scraper.prototype.vendorCode = 'barnesandnoble';
Scraper.prototype.name       = 'Barnes & Noble';
Scraper.prototype.homepage   = 'http://www.barnesandnoble.com/';

Scraper.prototype.countries  = allCountries;
Scraper.prototype.currencies = ['USD'];



// Scraper.prototype.isbnURLTemplate = 'http://www.barnesandnoble.com/w/?ean={isbn}';
Scraper.prototype.isbnURLTemplate = 'http://www.barnesandnoble.com/s/{isbn}';


Scraper.prototype.jqueryExtract = function ($) {

  var results = {
    entries: [],
  };

  var buyBox = $('div#product-buy-box-2s-1');

  // Not Found
  if (
    $('div.search-noresults-message').toArray().length ||  // no results found
    // !buyBox.toArray().length || // perhaps redirect to nook book?
    buyBox.find('div.not-available').toArray().length // found, but not avail
  ) {
    _.each(regions, function (regionData) {
      results.entries.push({
        countries: regionData.countries,
        currency: 'USD',
        offers: {},
      });
    });

    return results;
  }

  // Get price and availability
  var price = parseFloat(buyBox.find('div[itemprop="price"]').text().replace(/[^\d.]/g, ''));
  var availabilityNote = buyBox.find('div.delivery-message').eq(0).text().trim().replace(/\s+details$/, '');

  _.each(regions, function (regionData) {

    var shipping = regionData.shipping;
    var shippingNote = regionData.shippingNote;

    var freeShippingEligible = buyBox.find('div.free-shipping').toArray().length;

    if (regionData.freeShippingAppliesAt && freeShippingEligible) {
      if (price >= regionData.freeShippingAppliesAt) {
        shipping = 0;
        shippingNote = 'Free shipping';
      } else {
        shippingNote += ' (FREE shipping on orders over $' + regionData.freeShippingAppliesAt + ')';
      }
    }

    var offers = {};
    offers.new = {
      availabilityNote: availabilityNote,
      price: price,
      shipping: shipping,
      shippingNote: shippingNote,
      currency: 'USD',
    };

    results.entries.push({
      countries: regionData.countries,
      currency: 'USD',
      offers: offers,
    });
  });

  return results;
};
