'use strict';

var WebScraper = require('./web-scraper');

// note that we can get the worldwide shipping prices from
// http://www.foyles.co.uk/help-delivery


var scraper = function (options) {
  this.init(options);
};

scraper.prototype = new WebScraper();


scraper.prototype.isbnURLTemplate = 'http://www.foyles.co.uk/Public/Shop/Search.aspx?sortBy=1&searchType=3&advance=true&isbn=%s';


scraper.prototype.jqueryExtract = function ($) {

  var results = {};

  results.title  = $('div.BookTitle').find('span[itemprop=name]').text();
  results.author = $('div.Author').first().text();

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
        condition: 'new',
        currency:  'GBP'
      };

      price.amount       = row.find('.OnlinePrice').text().replace(/[\D\.]/, '');
      price.availability = row.find('.Availtext').text().trim();

      prices.push(price);
    });
  
  return results;
};


module.exports = scraper;