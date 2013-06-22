'use strict';

var WebScraper = require('./web-scraper'),
    _          = require('underscore');

var Scraper = module.exports = function (options) {
  this.init(options);
};

Scraper.prototype = new WebScraper();

Scraper.prototype.vendorCode = 'tester';
Scraper.prototype.countries  = ['GB'];
Scraper.prototype.currencies = ['GBP'];


Scraper.prototype.isbnURLTemplate = 'http://www.example.com/book%s';


Scraper.prototype.jqueryExtract = function ($) {

  var results = {};

  results.found = ! /No search results/.test($('h2.MainTitle').text());

  results.title  = $('div.BookTitle').find('span[itemprop=name]').text();
  results.authors = _.map(
    $('div.Author').first().find('a'),
    function (author) { return $(author).text().trim(); }
  );

  var formats = results.formats = [];

  $('div.PurchaseTable')
    .find('tr.DarkGrey')
    .first()
    .each(function () {
      var row = $(this);
      if (! row.attr('class')) {
        return;
      }

      var price = {
        countries:       ['GB'],
        condition:       'new',
        currency:        'GBP',
        shippingNote: 'Free delivery in the UK for orders over £10',
        shipping:        2.5,
      };

      price.price = parseFloat(row.find('.OnlinePrice').text().replace(/[\D\.]/, '')) || null;

      price.availabilityNote = row.find('.Availtext').text().trim();

      if (price.price >= 10) {
        price.shipping = 0;
      }

      formats.push(price);
    });

  return results;
};

