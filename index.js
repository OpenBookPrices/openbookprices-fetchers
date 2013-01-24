'use strict';

var Fetcher = function () {
  
};

Fetcher.prototype.scrapers = {
  foyles: require('./src/foyles'),
};

Fetcher.prototype.fetch = function (options, cb) {

  var scraperName = options.vendor;
  var Scraper     = this.scrapers[scraperName];

  if (!Scraper) {
    return cb(new Error('Scraper for ' + scraperName + ' not found'));
  }

  // Run the scraper
  new Scraper(options).scrape(cb);
};

module.exports = Fetcher;