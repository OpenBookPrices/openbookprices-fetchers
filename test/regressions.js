'use strict';

var _             = require('underscore'),
    assert        = require('assert'),
    fs            = require('fs'),
    path          = require('path'),
    fetcher       = require('../'),
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

var overwrite = process.env.OVERWRITE_TESTS;

var testsByVendor = _.groupBy(
  getTests(),
  function (test) { return test.vendor; }
);

describe('Regression tests', function () {
  this.timeout(30000); // loooong time - some sites are slow, and net can be too

  _.each(_.keys(testsByVendor).sort(), function (vendor) {

    var vendorTests = testsByVendor[vendor].sort();

    describe(vendor, function () {
      var Scraper = fetcher.getScraper(vendor);

      _.each(vendorTests, function (test) {

        // Check that the vendor is enabled in config
        if (Scraper) {
          it(test.basename, function (done) {

            var scraper = new Scraper({ isbn: test.isbn, country: test.country, currency: test.currency });

            var content  = fs.readFileSync(test.expectedFile).toString();
            var expected =
              /^\{/.test(content) ?
              JSON.parse(content) :
              null;

            scraper.scrape(function (err, actual) {
              assert.ifError(err);

              // change all the actual times to be relative to a fixed start time.
              _.each(actual.entries, function (entry) {
                // reset using 1_000_000_000 as base
                entry.timestamp = 1000000000;
              });

              if (!expected || overwrite) {
                fs.writeFileSync(test.expectedFile, canonicalJSON(actual, null, 2));
              }

              if (!expected) {
                assert.ok(null, 'Had no data to compare to - now written to file. Run tests again.');
              } else {
                assert.deepEqual(actual, expected);
              }

              testResultsAreValid(actual);

              done();
            });
          });
        } else {
          it.skip(test.basename, function () {});
        }
      });
    });
  });
});


function testResultsAreValid(actual) {

  // check that the entries are all complete
  _.each(actual.entries, function (entry) {
    // console.log(entry);
    assert(_.isString(entry.isbn),     'entry.isbn missing or wrong type');
    assert(_.isString(entry.vendor),   'entry.vendor missing or wrong type');
    assert(_.isString(entry.currency), 'entry.currency missing or wrong type');
    assert(_.isArray(entry.countries), 'entry.countries missing or wrong type');
  });

}