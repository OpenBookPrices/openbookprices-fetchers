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
      basename: basename,
      expected: path.join(regressionsDir, filename),
      vendor:   parts[0],
      isbn:     parts[1],
      country:  parts[2],
      currency: parts[3],
    };
    
  });
  
  return tests;
}

var fetcher = new Fetcher();

var overwrite = true;

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
        
          var expected = JSON.parse(fs.readFileSync(test.expected));
        
          scraper.scrape(function (err, actual) {
            assert.ifError(err);
        
            actual = _.omit(actual, ['startTime', 'endTime', 'totalTime']);
        
            if (overwrite) {
              fs.writeFileSync(test.expected, canonicalJSON(actual, null, 2));
            }
        
            assert.deepEqual(actual, expected);
            done();
          });
        });
      });
    });
  });
});
