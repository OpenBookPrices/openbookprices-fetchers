"use strict";

var countries  = require("country-data").countries,
    _          = require("underscore");

// Delivery information sourced from:
// http://www.amazon.co.uk/gp/help/customer/display.html?nodeId=11072981

var shippingZones = {
  UK: {
    url: "http://www.amazon.co.uk/gp/help/customer/display.html?nodeId=10790441#first",
    item: 0.59,
    delivery: 2.16,
  },

  Europe1: {
    url: "http://www.amazon.co.uk/gp/help/customer/display.html?nodeId=200704660",
    item: 0.99,
    delivery: 4.49,
  },

  Europe2: {
    url: "http://www.amazon.co.uk/gp/help/customer/display.html?nodeId=200706040",
    item: 0.99,
    delivery: 4.99,
  },

  Europe3: {
    url: "http://www.amazon.co.uk/gp/help/customer/display.html?nodeId=200706080",
    item: 3.49,
    delivery: 5.69,
  },

  NorthAmerica: {
    url: "http://www.amazon.co.uk/gp/help/customer/display.html?nodeId=200706160",
    item: 2.99,
    delivery: 3.99,
  },

  Japan: {
    url: "http://www.amazon.co.uk/gp/help/customer/display.html?nodeId=200706200",
    item: 2.99,
    delivery: 4.99,
  },

  RestOfWorld: {
    url: "http://www.amazon.co.uk/gp/help/customer/display.html?nodeId=200706240",
    item: 2.99,
    delivery: 5.49,
  },
};

// tot up the item and delivery into total
_.chain(shippingZones).values().each(function (entry) {
  entry.total = entry.delivery + entry.item;
});


var shippingNotes = {
  "first": "First Class delivery",
  "2to3":  "2 to 3 business days",
  "3to4":  "3 to 4 business days",
  "3to5":  "3 to 5 business days",
  "5to7":  "5 to 7 business days",
  "7to10": "7 to 10 business days",
  "7to12": "7 to 12 business days",
};


var shippingBlocks = [

  {
    note: shippingNotes.first,
    amount: shippingZones.UK.total,
    superSaverPermitted: true,
    countries: [
      "GB", // UK
    ],
  },

  {
    note: shippingNotes["2to3"],
    amount: shippingZones.Europe1.total,
    countries: [
      "BE", // Belgium
      "DE", // Germany
      "LU", // Luxembourg
      "NL", // Netherlands
    ],
  },

  {
    note: shippingNotes["3to4"],
    amount: shippingZones.Europe1.total,
    countries: [
      "DK", // Denmark
    ],
  },

  {
    note: shippingNotes["3to5"],
    amount: shippingZones.Europe1.total,
    countries: [
      "AT", // Austria
      "CH", // Switzerland
      "FR", // France
      "IE", // Republic of Ireland
      "MC", // Monaco
    ],
  },

  {
    note: shippingNotes["3to5"],
    amount: shippingZones.Europe2.total,
    countries: [
      "AD", // Andorra
      "ES", // Spain
      "FI", // Finland
      "GI", // Gibraltar
      "GR", // Greece
      "IS", // Iceland
      "IT", // Italy
      "LI", // Liechtenstein
      "NO", // Norway
      "PT", // Portugal
      "SE", // Sweden
      "SM", // San Marino
      "VA", // Vatican City (Holy See)
    ],
  },

  {
    note: shippingNotes["5to7"],
    amount: shippingZones.NorthAmerica.total,
    countries: [
      "CA", // Canada
      "US", // United States
    ],
  },

  {
    note: shippingNotes["5to7"],
    amount: shippingZones.Japan.total,
    countries: [
      "JA", // Japan
    ],
  },

  {
    note: shippingNotes["7to10"],
    amount: shippingZones.Europe3.total,
    countries: [
      "BA", // Bosnia Herzegovina
      "BG", // Bulgaria
      "BY", // Belarus
      "CY", // Cyprus
      "CZ", // Czech Republic
      "EE", // Estonia
      "FO", // Faroe Islands
      "GL", // Greenland
      "HR", // Croatia
      "HU", // Hungary
      "LT", // Lithuania
      "LV", // Latvia
      "ME", // Montenegro
      "MK", // Macedonia
      "MT", // Malta
      "PL", // Poland
      "RO", // Romania
      "RS", // Serbia
      "SI", // Slovenia
      "SK", // Slovakia
      "TR", // Turkey
    ],
  },

  {
    note: shippingNotes["7to10"],
    amount: shippingZones.RestOfWorld.total,
    countries: [
      "AU", // Australia
      "BH", // Bahrain
      "BR", // Brazil
      "CL", // Chile
      "CN", // China
      "CO", // Colombia
      "CR", // Costa Rica
      "EG", // Egypt
      "HK", // Hong Kong
      "IN", // India
      "ID", // Indonesia
      "IL", // Israel
      "JO", // Jordan
      "KR", // Korea
      "KW", // Kuwait
      "MY", // Malaysia
      "MX", // Mexico
      "NZ", // New Zealand
      "OM", // Oman
      "PA", // Panama
      "PE", // Peru
      "PH", // Philippines
      "QA", // Qatar
      "SA", // Saudi Arabia
      "SG", // Singapore
      "ZA", // South Africa
      "TW", // Taiwan
      "TH", // Thailand
      "AE", // United Arab Emirates
      "UY", // Uruguay
      "VE", // Venezuela
    ],
  },

];


// get a list of all the countries we've seen
var seenCountries = _
  .chain(shippingBlocks)
  .pluck("countries")
  .flatten()
  .value();

// create a list of all the countries that have not been seen yet
var allCountries = _
  .chain(countries.all)
  .where({status: "assigned"})
  .pluck("alpha2")
  .value();
var restOfWorldCountries =
  _.difference(allCountries, seenCountries);

shippingBlocks.push({
  note: shippingNotes["7to12"],
  amount: shippingZones.RestOfWorld.total,
  countries: restOfWorldCountries,
});

module.exports = {
  blocks: shippingBlocks,
  countries: allCountries,
};

