'use strict';

var WebScraper = require('./web-scraper'),
    _          = require('underscore');

// note that we can get the worldwide shipping prices from
// http://www.foyles.co.uk/help-delivery


var Scraper = module.exports = function (options) {
  this.init(options);
};

Scraper.prototype = new WebScraper();


Scraper.prototype.isbnURLTemplate = 'http://www.foyles.co.uk/Public/Shop/Search.aspx?sortBy=1&searchType=3&advance=true&isbn=%s';


Scraper.prototype.jqueryExtract = function ($) {

  var results = {};

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
        destination:     'GB',
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
  ],
  'no':  [
    /Available through New & Used Online only/,
  ],
};

Scraper.tests = [
  {
    isbn: '9781419704406',
    expected: {
      "url": "http://www.foyles.co.uk/witem/art-design/vogue-the-editors-eye,anna-wintour-conde-nast-9781419704406",
      "title": "Vogue: The Editor's Eye",
      "authors": [
        "Anna Wintour",
        "Conde Nast Publications Inc."
      ],
      "prices": [
        {
          "amount": 31.5,
          "availability": true,
          "availabilityComment": "Despatched in 1 business day.",
          "condition": "new",
          "currency": "GBP",
          "destination": "GB",
          "shipping": 0,
          "shippingComment": "Free delivery in the UK for orders over £10",
          "total": 31.5,
        }
      ]
    }
  },
  {
    isbn: '9780307353139',
    expected: {
      "url": "http://www.foyles.co.uk/mpitem/marketplace/4-hour-workweek-escape-9-5-live,timothy-ferriss-9780307353139",
      "title": "4 hour workweek escape 9 5 live anywhere and join the new rich",
      "authors": [
        "timothy ferriss"
      ],
      "prices": [
        {
          "amount": 0,
          "availability": false,
          "availabilityComment": "Available through New & Used Online only",
          "condition": "new",
          "currency": "GBP",
          "destination": "GB",
          "shipping": 2.5,
          "shippingComment": "Free delivery in the UK for orders over £10",
          "total": 2.5,
        }
      ],
    }
  }
];
