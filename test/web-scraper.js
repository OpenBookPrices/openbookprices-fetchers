'use strict';

var assert     = require('assert'),
    WebScraper = require('../src/web-scraper'),
    _          = require('underscore');

var TestScraper = function (options) {
  this.init(options);
};
TestScraper.prototype = new WebScraper();

describe('WebScraper', function () {
  describe('#constructor()', function () {
    it('should validate isbn13 numbers', function () {
      
      // no isbn throws
      assert.ok(
        new TestScraper({isbn: '9784873113364'})
      );

      // no isbn throws
      assert.throws(
        function () { new TestScraper(); },
        /Need an isbn/
      );

      var testISBNs = {
        'foo'               : new RegExp('Not a valid ISBN13 "foo"'),
        '978-4-87311-336-4' : new RegExp('Not a valid ISBN13 "978-4-87311-336-4"'),
        '9784873113360'     : new RegExp('Not a valid ISBN13 "9784873113360"'),
        '4873113369'        : new RegExp('Not a valid ISBN13 "4873113369"'),
      };

      // bad configs throw
      _.each(
        testISBNs,
        function (regex, badIsbn) {
          assert.throws(
            function () {
              new TestScraper({isbn: badIsbn});
            },
            regex
          );
        }
      );

    });
  });
});
