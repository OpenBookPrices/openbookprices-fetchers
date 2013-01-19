var util    = require('util'),
    _       = require('underscore'),
    jsdom   = require("jsdom"),
    fs      = require("fs"),
    request = require('request');

var jquerySource  = fs.readFileSync( __dirname + "/jquery.js" ).toString();

// note that we can get the worldwide shipping prices from
// http://www.foyles.co.uk/help-delivery


var scraper = function () {
  
}


scraper.prototype.isbnURLTemplate = 'http://www.foyles.co.uk/Public/Shop/Search.aspx?sortBy=1&searchType=3&advance=true&isbn=%s'


function get ( url, cb ) {
  var results = {};
  results.startTime = Date.now();

  request(
    {
      url: url,
      proxy: process.env.http_proxy, // 'http://localhost:8123/'
    },
    function (error, response, body) {

      if ( error ) return cb(error);
      
      results.url = response.request.uri.href;    
      
      jsdom.env({
        html: body,
        src: [ jquerySource ],
        done: function (errors, window) {
          cb( errors, window, results );
        }
      });
    }
  )
}

scraper.prototype.scrape = function ( options, cb ) {

  options.searchURL = util.format(this.isbnURLTemplate, options.isbn);

  get(
    options.searchURL,
    function (errors, window, results) {
      var $ = window.$;
      
      if ( errors ) throw errors;

      results.title  = $("div.BookTitle").find("span[itemprop=name]").text();
      results.author = $("div.Author").first().text();

      var prices = results.prices = [];
      
      $("div.PurchaseTable")
        .find("tr.DarkGrey")
        .first()
        .each(function () {
          var row = $(this);
          if (! row.attr('class')) return;
          
          var price = {
            condition: 'new',
            currency:  'GBP'
          };

          price.amount       = row.find('.OnlinePrice').text().replace(/[\D\.]/, '');
          price.availability = row.find('.Availtext').text().trim();

          prices.push( price );
        })

      results.endTime = Date.now();
      results.totalTime = results.endTime - results.startTime;

      cleanup( results );

      console.log( JSON.stringify(results, null, 2) );

      cb(null, { options: options, results: results} );

    }
  );
  
}

function cleanup ( results ) {
  _.each( results, function (val, key) {
    if ( _.isString(val) ) {
      val = val.replace(/\s+/, ' ');
      results[key] = val.trim();      
    }
  });
}

module.exports = scraper;