'use strict';

var WebScraper = require('./web-scraper'),
    countries  = require('country-data').countries,
    _          = require('underscore');


// note that we can get the worldwide shipping prices from
// http://www.foyles.co.uk/help-delivery
var regions = {
  all: _.pluck(countries.all, 'alpha2'),

  uk: ['GB'],

  europe: [
    // Austria, Belgium, Denmark, France, Germany, Greece, Iceland,
    // Irish Republic, Italy, Luxembourg, Netherlands, Portugal, Spain,
    // Sweden and Switzerland
    'AT', 'BE', 'DK', 'FR', 'DE', 'GR', 'IS', 'IE', 'IT', 'LU', 'NL', 'PT',
    'ES', 'SE', 'CH'
  ],

  northAmerica: ['US', 'CA'],
};

regions.restOfWorld = _.difference(
  regions.all,
  regions.uk, regions.europe, regions.northAmerica
);


var Scraper = module.exports = function (options) {
  this.init(options);
};

Scraper.prototype = new WebScraper();

Scraper.prototype.vendorCode = 'foyles';
Scraper.prototype.countries  = regions.all;
Scraper.prototype.currencies = ['GBP'];



Scraper.prototype.isbnURLTemplate = 'http://www.foyles.co.uk/Public/Shop/Search.aspx?sortBy=1&searchType=3&advance=true&isbn={isbn}';


Scraper.prototype.jqueryExtract = function ($) {

  var results = {};

  if (/No search results/.test($('h2.MainTitle').text())) {
    results.found = false;
    results.prices = [];

    var notFoundPrice = {
      countries: regions.all,
      canSell: false,
      canSellComment: 'Book not found on the website',
    };

    _.each(this.currencies, function (currency) {
      results.prices.push(_.extend({ currency: currency }, notFoundPrice));
    });

    return results;
  }

  results.title  = $('div.BookTitle').find('span[itemprop=name]').text();
  results.authors = _.map(
    $('div.Author').first().find('a'),
    function (author) { return $(author).text().trim(); }
  );

  var prices = results.prices = [];

  $('div.PurchaseTable')
    .find('tr.DarkGrey')
    .first()
    .each(function () {
      var row = $(this);
      if (! row.attr('class')) {
        return;
      }

      var basePrice = {
        condition: 'new',
        currency:  'GBP',
        canSell:   true,
      };

      var amount = basePrice.amount = parseFloat(row.find('.OnlinePrice').text().replace(/[\D\.]/, '')) || null;
      basePrice.availabilityComment = row.find('.Availtext').text().trim();

      // UK
      prices.push(_.extend({}, basePrice, {
        countries: regions.uk,
        shipping: amount < 10 ? 2.5 : 0,
        shippingComment: 'Free second class delivery in the UK for orders over £10',
      }));

      // Europe
      prices.push(_.extend({}, basePrice, {
        countries: regions.europe,
        shipping: 5,
        shippingComment: 'Air mail from UK: 4 - 14 days',
      }));

      // N. America
      prices.push(_.extend({}, basePrice, {
        countries: regions.northAmerica,
        shipping: 7,
        shippingComment: 'Air mail from UK: 4 - 14 days',
      }));

      // N. America
      prices.push(_.extend({}, basePrice, {
        countries: regions.restOfWorld,
        shipping: 8,
        shippingComment: 'Air mail from UK: 7 - 21 days',
      }));

    });

  return results;
};


Scraper.prototype.availabilityTests = {
  'yes': [
    /Despatched in \d business day/,
    /Printed to order\. Despatched in/,
  ],
  'no':  [
    /Available through New & Used Online only/,
  ],
};

