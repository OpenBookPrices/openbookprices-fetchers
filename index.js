'use strict';

var Fetcher = function () {
  
};

Fetcher.prototype.scrapers = {
  foyles: require('./src/foyles'),
};

Fetcher.prototype.fetch = function (options, cb) {

  var scraper_name = options.vendor;
  var Scraper      = this.scrapers[scraper_name];

  if (!Scraper) {
    return cb(new Error('Scraper for ' + scraper_name + ' not found'));
  }

  // Run the scraper
  new Scraper(options).scrape(cb);
};

module.exports = Fetcher;