
var Fetcher = function () {
  
};

Fetcher.prototype.fetch = function (options, cb) {

  // just work with one scraper
  var foyles = new (require('./src/foyles'))();

  foyles.scrape( options, cb );
};

module.exports = Fetcher;