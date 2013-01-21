var _       = require('underscore'),
    assert  = require('assert'),
    Fetcher = require('../');


var fetcher = new Fetcher();

_.each (_.keys(fetcher.scrapers), function (vendor) {
  describe(vendor, function () {

    var Scraper = fetcher.scrapers[vendor];
    var tests   = Scraper.tests;
    
    _.each(tests, function (test) {
      
      describe(test.isbn, function () {

        var scraper = new Scraper({ isbn: test.isbn });

        it('should scrape correctly', function (done) {
          scraper.scrape(function (err, actual) {
            assert.ifError(err);

            actual = _.omit(actual, ['startTime', 'endTime', 'totalTime'] );

            assert.deepEqual(actual, test.expected);
            done();
          });
        });

      });

    });
    
  });
});

//  {
//   
//   describe('WebScraper', function () {
//     describe('#constructor()', function () {
//       it('should validate and convert isbn numbers', function () {
// 
//         // no isbn throws
//         assert.throws(
//           function () { new TestScraper(); },
//           /Need an isbn/
//         );
// 
//         // bad isbn throws
//         assert.throws(
//           function () { new TestScraper({isbn: 'foo'}); },
//           /Not a valid ISBN "foo"/
//         );
// 
//         // good isbn is ok
//         var scraper = new TestScraper({ isbn: '978-4-87311-336-4' });
//         assert.equal(scraper.isbn, '9784873113364');
// 
//         // convert isbn10 to isbn13
//         var scraper2 = new TestScraper({isbn: '4-87311-336-9'});
//         assert.equal(scraper2.isbn, '9784873113364');
// 
//       });
//     });
//   });
//   
// }
