"use strict";

var regions    = require("country-data").regions,
    _          = require("underscore");

// Delivery information sourced from:
// http://www.amazon.co.uk/gp/help/customer/display.html?nodeId=11072981

var shippingZones = {
  US: {
    // Note that this is actually for the "Contiguous US", so not Alaska, Hawaii, Puerto Rico
    url: "http://www.amazon.com/gp/help/customer/display.html?nodeId=468636",
    item: 3.00,
    delivery: 0.99,
  },

  Canada: {
    url: "http://www.amazon.com/gp/help/customer/display.html??nodeId=596192",
    item: 4.99,
    delivery: 4.49,
  },

  LatinAmerica: {
    url: "http://www.amazon.com/gp/help/customer/display.html?nodeId=596202",
    item: 4.99,
    delivery: 4.99,
  },

  AtlanticCarribean: {
    url: "http://www.amazon.com/gp/help/customer/display.html?nodeId=596196",
    item: 6.99,
    delivery: 6.99,
  },

  Europe: {
    url: "http://www.amazon.com/gp/help/customer/display.html?nodeId=596194",
    item: 3.99,
    delivery: 3.99,
  },

  Israel: {
    url: "http://www.amazon.com/gp/help/customer/display.html?nodeId=596198",
    item: 6.99,
    delivery: 3.99,
  },

  MiddleEast: {
    url: "http://www.amazon.com/gp/help/customer/display.html?nodeId=596204",
    item: 6.99,
    delivery: 6.99,
  },

  Africa: {
    url: "http://www.amazon.com/gp/help/customer/display.html?nodeId=596186",
    item: 6.99,
    delivery: 6.99,
  },

  Australia: {
    url: "http://www.amazon.com/gp/help/customer/display.html?nodeId=596190",
    item: 4.99,
    delivery: 5.49,
  },

  Japan: {
    url: "http://www.amazon.com/gp/help/customer/display.html?nodeId=596200",
    item: 2.99,
    delivery: 2.49,
  },

  AsiaAndPacificIslands: {
    url: "http://www.amazon.com/gp/help/customer/display.html?nodeId=596188",
    item: 4.99,
    delivery: 4.99,
  },
};

// tot up the item and delivery into total
_.chain(shippingZones).values().each(function (entry) {
  entry.total = entry.delivery + entry.item;
});


var shippingNotes = {
  Africa:                "18 to 32 business days", // regional average
  AsiaAndPacificIslands: "18 to 32 business days", // regional average
  AtlanticCarribean:     "18 to 32 business days", // regional average
  Australia:             "18 to 32 business days",
  Canada:                "7 to 12 business days",
  Europe:                "18 to 32 business days", // regional average
  Israel:                "18 to 32 business days",
  Japan:                 "18 to 32 business days",
  LatinAmerica:          "18 to 32 business days", // regional average
  MiddleEast:            "18 to 32 business days", // regional average
  US:                    "3 to 5 business days",   // Contiguous US
};


var shippingBlocks = [

  // More specific blocks first, eg single countries
  {
    note: shippingNotes.US,
    amount: shippingZones.US.total,
    superSaverPermitted: true,
    superSaverMinimum: 35,
    countries: [ "US" ],
  },
  {
    note: shippingNotes.Canada,
    amount: shippingZones.Canada.total,
    countries: [ "CA" ],
  },
  {
    note: shippingNotes.Israel,
    amount: shippingZones.Israel.total,
    countries: [ "IL" ],
  },
  {
    note: shippingNotes.Australia,
    amount: shippingZones.Australia.total,
    countries: [ "AU" ],
  },
  {
    note: shippingNotes.Japan,
    amount: shippingZones.Japan.total,
    countries: [ "JP" ],
  },

  // now regions, more specific ones first
  {
    note: shippingNotes.AtlanticCarribean,
    amount: shippingZones.AtlanticCarribean.total,
    countries: regions.caribbeanAndAtlanticIslands.countries,
  },
  {
    note: shippingNotes.LatinAmerica,
    amount: shippingZones.LatinAmerica.total,
    countries: regions.latinAmerica.countries,
  },
  {
    note: shippingNotes.Europe,
    amount: shippingZones.Europe.total,
    countries: regions.europe.countries,
  },
  {
    note: shippingNotes.MiddleEast,
    amount: shippingZones.MiddleEast.total,
    countries: regions.middleEast.countries,
  },
  {
    note: shippingNotes.AsiaAndPacificIslands,
    amount: shippingZones.AsiaAndPacificIslands.total,
    countries: _.flatten([regions.asia.countries, regions.pacificIslands.countries]),
  },
  {
    note: shippingNotes.Africa,
    amount: shippingZones.Africa.total,
    countries: regions.africa.countries,
  },
];


// store all countries we've seen in here
var seenCountries = [];

// go through all the shippingBlocks and make sure that later duplicated
// countries are removed from the blocks.
_.each(shippingBlocks, function (block) {
  block.countries = _.difference(block.countries, seenCountries).sort();
  seenCountries = _.flatten([seenCountries, block.countries]);
});

module.exports = {
  blocks: shippingBlocks,
  countries: seenCountries,
};
