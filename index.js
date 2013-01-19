
var Fetcher = function () {
  
};

Fetcher.prototype.fetch = function (options, cb) {

  // just work with one scraper
  var Foyles = require('./src/foyles');
  var foyles = new Foyles(options);

  foyles.scrape( cb );
};

module.exports = Fetcher;