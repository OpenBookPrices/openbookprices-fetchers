'use strict';

var _             = require('underscore'),
    assert        = require('assert'),
    fs            = require('fs'),
    path          = require('path'),
    Fetcher       = require('../'),
    canonicalJSON = require('canonical-json');


function getTests() {
  var regressionsDir = path.join(path.resolve(__dirname), 'regressions');
  var testFileNames  = fs.readdirSync(regressionsDir);
  
  
  var tests = _.map(testFileNames, function (filename) {
  
    var basename = path.basename(filename, '.json');
    var parts    = basename.split('-');
    
    return {
      basename:     basename,
      expectedFile: path.join(regressionsDir, filename),
      vendor:       parts[0],
      isbn:         parts[1],
      country:      parts[2],
      currency:     parts[3],
    };
    
  });
  
  return tests;
}

var fetcher = new Fetcher();

var overwrite = process.env.OVERWRITE_TESTS;

var testsByVendor = _.groupBy(
  getTests(),
  function (test) { return test.vendor; }
);

describe('Regression tests', function () {
  this.timeout(20000); // long time - some sites are slow

  _.each(_.keys(testsByVendor).sort(), function (vendor) {

    var vendorTests = testsByVendor[vendor].sort();

    describe(vendor, function () {

      var Scraper = fetcher.scrapers[vendor];

      _.each(vendorTests, function (test) {
    
        var scraper = new Scraper({ isbn: test.isbn });
        
        it(test.basename, function (done) {
        
          var content  = fs.readFileSync(test.expectedFile).toString();
          var expected =
            /^\{/.test(content) ?
            JSON.parse(content) :
            null;
        
          scraper.scrape(function (err, actual) {
            assert.ifError(err);
        
            var startTimeReference = Math.floor(actual._startTime / 1000);

            // strip all keys starting with underscore
            actual = _.omit(
              actual,
              _.filter(_.keys(actual), function (val) { return (/^_/).test(val); })
            );

            // change all the actual times to be relative to a fixed start time.
            _.each(actual.prices, function (price) {
              assert.equal(
                price.validUntil,
                startTimeReference + price.ttl
              );
              // reset using 1_000_000_000 as base
              price.validUntil = 1000000000 + price.ttl;
            });

            if (! expected || overwrite) {
              fs.writeFileSync(test.expectedFile, canonicalJSON(actual, null, 2));
            }
            
            if (!expected) {
              assert.ok(expected, 'Had no data to compare to - now written to file. Run tests again.');
            } else {
              assert.deepEqual(actual, expected);
            }
            
            done();
          });
        });
      });
    });
  });
});
