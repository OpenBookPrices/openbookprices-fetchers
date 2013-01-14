var util = require('util');


var scraper = function () {
  
}


scraper.prototype.isbnURLTemplate = 'http://www.foyles.co.uk/Public/Shop/Search.aspx?sortBy=1&searchType=3&advance=true&isbn=%s'

scraper.prototype.scrape = function ( options, cb ) {

  options.searchURL = util.format(this.isbnURLTemplate, options.isbn);
  
  cb(null, options);

}

module.exports = scraper;