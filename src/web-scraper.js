'use strict';

var uriTemplateParser   = require('uri-template'),
    _                   = require('underscore'),
    cheerio             = require('cheerio'),
    request             = require('request'),
    GeneralScraper      = require('./general-scraper');

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

      var $ = cheerio.load(body);
      cb(null, $);
    }
  );
};


scraper.prototype.scrape = function (cb) {
  var self    = this;
  var results = this.results;

  var url  = uriTemplateParser.parse(this.isbnURLTemplate).expand({isbn: this.isbn});

  this.get(
    url,
    function (errors, $) {

      if (errors) {
        return cb(errors);
      }

      _.extend(results, self.jqueryExtract($));

      results._endTime = Date.now();
      results._totalTime = results._endTime - results._startTime;

      self.cleanup(results);

      cb(null, self.results);

    }
  );

};


module.exports = scraper;
