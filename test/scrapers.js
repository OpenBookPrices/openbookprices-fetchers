var _             = require('underscore'),
    assert        = require('assert'),
    fs            = require('fs'),
    path          = require('path'),
    Fetcher       = require('../'),
    canonicalJSON = require('canonical-json');


function getTests () {
  var regressionsDir = path.join( path.resolve(__dirname), 'regressions' );
  var testFileNames  = fs.readdirSync(regressionsDir);
  
  
  var tests = _.map(testFileNames, function (filename) {
  
    var parts = path.basename(filename, '.json').split('-');
    
    return {
      expected: path.join( regressionsDir, filename ),
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

_.each (getTests(), function (test) {

  var vendor = test.vendor;

  describe(vendor, function () {

    var Scraper = fetcher.scrapers[vendor];
    
    describe(test.isbn, function () {
    
      var scraper = new Scraper({ isbn: test.isbn });
    
      it('should scrape correctly', function (done) {

        var expected = JSON.parse( fs.readFileSync(test.expected) );

        scraper.scrape(function (err, actual) {
          assert.ifError(err);
    
          actual = _.omit(actual, ['startTime', 'endTime', 'totalTime'] );

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
