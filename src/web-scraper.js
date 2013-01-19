var util    = require('util'),
    _       = require('underscore'),
    jsdom   = require("jsdom"),
    fs      = require("fs"),
    request = require('request'),
    ISBN    = require('isbn').ISBN;

var jquerySource  = fs.readFileSync( __dirname + "/jquery.js" ).toString();

var scraper = function () {
  
}

scraper.prototype.init = function ( options ) {
  _.extend(this, options);
  
  // Check that we have the values we need
  if (!this.isbn) {
    throw "Need an isbn";
  }
  var isbn = ISBN.parse(this.isbn);
  if (!isbn) {
    throw "Not a valid ISBN '" + this.isbn + "'";
  }
  this.isbn = isbn.asIsbn13();

  this.results = {};
};

scraper.prototype.get = function( url, cb ) {
  var self    = this;
  var results = this.results;
  results.startTime = Date.now();

  request(
    {
      url: url,
      proxy: process.env.http_proxy,
    },
    function (error, response, body) {

      if ( error ) return cb(error);
      
      results.url = response.request.uri.href;    
      
      jsdom.env({
        html: body,
        src: [ jquerySource ],
        done: function (errors, window) {
          cb( errors, window );
        }
      });
    }
  )
};

scraper.prototype.scrape = function ( cb ) {
  var self    = this;
  var results = this.results;

  var url  = util.format(this.isbnURLTemplate, this.isbn);

  this.get(
    url,
    function (errors, window) {
      if ( errors ) throw errors;
      
      var $ = window.$;
      _.extend(results, self.jqueryExtract($) );


      results.endTime = Date.now();
      results.totalTime = results.endTime - results.startTime;

      self.cleanup( results );

      console.log( JSON.stringify(results, null, 2) );

      cb(null);

    }
  );
  
};


scraper.prototype.cleanup = function ( results ) {
  _.each( results, function (val, key) {
    if ( _.isString(val) ) {
      val = val.replace(/\s+/, ' ');
      results[key] = val.trim();      
    }
  });
}

module.exports = scraper;