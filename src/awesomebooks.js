'use strict';

var WebScraper = require('./web-scraper'),
    _          = require('underscore'),
    config     = require('config'),
    url        = require('url');

config.setModuleDefaults('awesomebooks', {
  enabled: true,
});


// http://www.awesomebooks.com/help/shipping/
var regions = {
  uk: {
    countries: ['GB'],
    shipping: 0,
    shippingNote: '2-5 Days',
  },

  europe: {
    countries: [
      'AT', // Austria
      'BE', // Belgium
      'CY', // Cyprus
      'CZ', // Czech Republic
      'DK', // Denmark
      'FI', // Finland
      'FR', // France
      'DE', // Germany
      'GR', // Greece
      'LU', // Luxembourg
      'MT', // Malta
      'PL', // Poland
      'IE', // Republic of Ireland
      'IT', // Italy
      'NL', // Netherlands
      'NO', // Norway
      'PT', // Portugal
      'SM', // San Marino
      'SI', // Slovenia
      'ES', // Spain
      'SE', // Sweden
      'CH', // Switzerland
    ],
    shipping: 2.99,
    shippingNote: '3-14 Days (flat fee for any size of order)',
  },

  northAmerica: {
    countries: ['US', 'CA'],
    shipping: 2.99,
    shippingNote: '5-15 Days (flat fee for any size of order)',
  },

  australiaNewZealand: {
    countries: ['AU', 'NZ'],
    shipping: 2.99,
    shippingNote: '5-15 Days (flat fee for any size of order)',
  },

  restOfWorld: {
    countries: [
      'AR', // ARGENTINA
      'BH', // BAHRAIN
      'BB', // BARBADOS
      'BM', // BERMUDA
      'BR', // BRAZIL
      'BG', // BULGARIA
      'CN', // CHINA
      'HR', // CROATIA
      'EG', // EGYPT
      'EE', // ESTONIA
      'FO', // FAROE ISLANDS
      'GI', // GIBRALTAR
      'GL', // GREENLAND
      'GG', // GUERNSEY
      'HK', // HONG KONG
      'HU', // HUNGARY
      'IS', // ICELAND
      'IN', // INDIA
      'IM', // ISLE OF MAN
      'IL', // ISRAEL
      'JP', // JAPAN
      'JE', // JERSEY
      'KR', // KOREA, REPUBLIC OF
      'LV', // LATVIA
      'LI', // LIECHTENSTEIN
      'MK', // MACEDONIA
      'MY', // MALAYSIA
      'MU', // MAURITIUS
      'MD', // MOLDOVA, REPUBLIC OF
      'MC', // MONACO
      'AN', // NETHERLANDS ANTILLES
      'NC', // NEW CALEDONIA
      'PR', // PUERTO RICO
      'QA', // QATAR
      'RU', // RUSSIAN FEDERATION
      'SG', // SINGAPORE
      'SK', // SLOVAKIA
      'ZA', // SOUTH AFRICA
      'TW', // TAIWAN, PROVINCE OF CHINA
      'TR', // TURKEY
      'AE', // UNITED ARAB EMIRATES
      'VA', // VATICAN CITY
      'VG', // VIRGIN ISLANDS, BRITISH
      'VI', // VIRGIN ISLANDS, U.S.
    ],
    shipping: 2.99,
    shippingNote: '5-21 Days (flat fee for any size of order)',
  },
};

var allCountries = _.chain(regions).values().pluck('countries').flatten().value();

var Scraper = module.exports = function (options) {
  this.init(options);
};

Scraper.prototype = new WebScraper();

Scraper.prototype.vendorCode = 'awesomebooks';
Scraper.prototype.name       = 'AwesomeBooks';
Scraper.prototype.homepage   = 'http://www.awesomebooks.com/';

Scraper.prototype.countries  = allCountries;
Scraper.prototype.currencies = ['GBP'];



Scraper.prototype.isbnURLTemplate = 'http://www.awesomebooks.com/book/{isbn}/book';


Scraper.prototype.jqueryExtract = function ($) {

  var results = {
    entries: [],
  };

  if (/Book details not found/.test($('div.error').text())) {

    _.each(regions, function (regionData) {
      results.entries.push({
        countries: regionData.countries,
        currency: 'GBP',
        offers: {},
      });
    });

    return results;
  }

  var listingBox = $('div.listing-box-content');

  // Get the actual url for this book, rather than the one we created to do the scrape.
  var facebookLikeURL = listingBox.find('iframe').attr('src');
  var bookURL = url.parse(facebookLikeURL, true).query.href;
  results.url = bookURL;

  // Get price and availability
  var price = parseFloat(listingBox.find('span.price').text().replace(/[^\d.]/g, ''));
  var availabilityNote = listingBox.find('p').eq(9).text().trim();

  // Get the condition and clean up.
  var rawCondition = listingBox.find('p').eq(10).text().replace(/[\w\s:]*:/, ' ').trim();
  var condition = rawCondition.match(/Used/) ? 'used' : 'new';

  _.each(regions, function (regionData) {

    var offers = {};
    offers[condition] = {
      availabilityNote: availabilityNote,
      price: price,
      shipping: regionData.shipping,
      shippingNote: regionData.shippingNote,
      url: bookURL,
    };

    results.entries.push({
      countries: regionData.countries,
      currency: 'GBP',
      offers: offers,
    });
  });

  return results;
};
