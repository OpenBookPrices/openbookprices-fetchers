'use strict';

var uriTemplateParser   = require('uri-template'),
    _                   = require('underscore'),
    jsdom               = require('jsdom'),
    fs                  = require('fs'),
    request             = require('request'),
    ean                 = require('ean'),
    GeneralScraper      = require('./general-scraper');

var jquerySource  = fs.readFileSync(__dirname + '/../lib/jquery.js').toString();

var scraper = function () {
  
};

scraper.prototype = new GeneralScraper();


scraper.prototype.get = function (url, cb) {
  var results = this.results;
  results._startTime = Date.now();

  // to keep jshint happy
  var httpProxy = 'http_proxy';

  request(
    {
      url: url,
      proxy: process.env[httpProxy],
    },
    function (error, response, body) {

      if (error) {
        return cb(error);
      }
      
      results.url = response.request.uri.href;
      
      jsdom.env({
        html: body,
        src: [ jquerySource ],
        done: function (errors, window) {
          cb(errors, window);
        }
      });
    }
  );
};


scraper.prototype.scrape = function (cb) {
  var self    = this;
  var results = this.results;

  var url  = uriTemplateParser.parse(this.isbnURLTemplate).expand({isbn: this.isbn});

  this.get(
    url,
    function (errors, window) {
      if (errors) {
        throw errors;
      }
      
      var $ = window.$;
      _.extend(results, self.jqueryExtract($));


      results._endTime = Date.now();
      results._totalTime = results._endTime - results._startTime;

      self.cleanup(results);


      cb(null, self.results);

    }
  );
  
};


module.exports = scraper;
