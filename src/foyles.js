'use strict';

var WebScraper = require('./web-scraper'),
    _          = require('underscore');

// note that we can get the worldwide shipping prices from
// http://www.foyles.co.uk/help-delivery


var Scraper = module.exports = function (options) {
  this.init(options);
};

Scraper.prototype = new WebScraper();

Scraper.prototype.vendorCode = 'foyles';
Scraper.prototype.countries  = ['GB'];
Scraper.prototype.currencies = ['GBP']


Scraper.prototype.isbnURLTemplate = 'http://www.foyles.co.uk/Public/Shop/Search.aspx?sortBy=1&searchType=3&advance=true&isbn=%s';


Scraper.prototype.jqueryExtract = function ($) {

  var results = {};
  
  results.found = ! /No search results/.test( $('h2.MainTitle').text() );

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
      
      var price = {
        contries:       ['GB'],
        condition:       'new',
        currency:        'GBP',
        shippingComment: 'Free delivery in the UK for orders over £10',
        shipping:        2.5,
      };
      
      price.amount = parseFloat(row.find('.OnlinePrice').text().replace(/[\D\.]/, '')) || null;

      price.availabilityComment = row.find('.Availtext').text().trim();

      if (price.amount >= 10) {
        price.shipping = 0;
      }

      prices.push(price);
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

