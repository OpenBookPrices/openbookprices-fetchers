'use strict';

var assert     = require('assert'),
    WebScraper = require('../src/web-scraper');

var TestScraper = function (options) {
  this.init(options);
};
TestScraper.prototype = new WebScraper();

describe('WebScraper', function () {
  describe('#constructor()', function () {
    it('should validate and convert isbn numbers', function () {
      
      // no isbn throws
      assert.throws(
        function () { new TestScraper(); },
        /Need an isbn/
      );

      // bad isbn throws
      assert.throws(
        function () { new TestScraper({isbn: 'foo'}); },
        /Not a valid ISBN "foo"/
      );

      // good isbn is ok
      var scraper = new TestScraper({ isbn: '978-4-87311-336-4' });
      assert.equal(scraper.isbn, '9784873113364');

      // convert isbn10 to isbn13
      var scraper2 = new TestScraper({isbn: '4-87311-336-9'});
      assert.equal(scraper2.isbn, '9784873113364');

    });
  });
});
