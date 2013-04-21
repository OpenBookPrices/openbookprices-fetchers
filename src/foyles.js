'use strict';

var WebScraper = require('./web-scraper'),
    countries  = require('country-data').countries,
    _          = require('underscore');


// note that we can get the worldwide shipping prices from
// http://www.foyles.co.uk/help-delivery


var Scraper = module.exports = function (options) {
  this.init(options);
};

Scraper.prototype = new WebScraper();

Scraper.prototype.vendorCode = 'foyles';
Scraper.prototype.countries  = ['GB'];
Scraper.prototype.currencies = ['GBP'];

// For shipping rates http://www.foyles.co.uk/help-delivery
var regions = {}

regions.uk = ['GB'];

regions.europe = [
  // Austria, Belgium, Denmark, France, Germany, Greece, Iceland,
  // Irish Republic, Italy, Luxembourg, Netherlands, Portugal, Spain,
  // Sweden and Switzerland
  'AT', 'BE', 'DK', 'FR', 'DE', 'GR', 'IS', 'IE', 'IT', 'LU', 'NL', 'PT',
  'ES', 'SE', 'CH'
];

regions.northAmerica = ['US', 'CA'];

regions.restOfWorld = _.difference(
  _.pluck(countries.all, 'alpha2'),
  regions.uk, regions.europe, regions.northAmerica
);


console.log( regions );


Scraper.prototype.isbnURLTemplate = 'http://www.foyles.co.uk/Public/Shop/Search.aspx?sortBy=1&searchType=3&advance=true&isbn={isbn}';


Scraper.prototype.jqueryExtract = function ($) {

  var results = {};

  results.found = ! /No search results/.test($('h2.MainTitle').text());

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
        condition:       'new',
        currency:        'GBP',
      };

      var amount = basePrice.amount = parseFloat(row.find('.OnlinePrice').text().replace(/[\D\.]/, '')) || null;
      basePrice.availabilityComment = row.find('.Availtext').text().trim();

      prices.push(_.extend(basePrice, {
        countries: regions.uk,
        shipping: amount < 10 ? '2.50' : 0,
        shippingComment: 'Free delivery in the UK for orders over £10',
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

