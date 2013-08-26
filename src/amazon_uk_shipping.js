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
    note: "first",
    zone: "UK",
    countries: [
      "GB", // UK
    ],
  },

  {
    note: "2to3",
    zone: "Europe1",
    countries: [
      "BE", // Belgium
      "DE", // Germany
      "LU", // Luxembourg
      "NL", // Netherlands
    ],
  },

  {
    note: "3to4",
    zone: "Europe1",
    countries: [
      "DK", // Denmark
    ],
  },

  {
    note: "3to5",
    zone: "Europe1",
    countries: [
      "AT", // Austria
      "CH", // Switzerland
      "FR", // France
      "IE", // Republic of Ireland
      "MC", // Monaco
    ],
  },

  {
    note: "3to5",
    zone: "Europe2",
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
    note: "5to7",
    zone: "NorthAmerica",
    countries: [
      "CA", // Canada
      "US", // United States
    ],
  },

  {
    note: "5to7",
    zone: "Japan",
    countries: [
      "JA", // Japan
    ],
  },

  {
    note: "7to10",
    zone: "Europe3",
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
    note: "7to10",
    zone: "RestOfWorld",
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




// store all shipping details in here
var shippingCountryLookup = {};

// for each country store the shipping details
_.each(shippingBlocks, function (block) {

  var note = shippingNotes[block.note];
  var zone = shippingZones[block.zone];
  var amount = zone.delivery + zone.item;

  _.each(block.countries, function (country) {
    shippingCountryLookup[country] = {
      shippingNote: note,
      shipping: amount,
    };
  });
});



// for remaining countries use the defaults
// for each country store the shipping details
var restOfWorldNote = shippingNotes["7to12"];
var restOfWorldZone = shippingZones.RestOfWorld;
var restOfWorldAmount = restOfWorldZone.delivery + restOfWorldZone.item;

_.each(countries.all, function (country) {

  var code = country.alpha2;

  // check we've not already been added to the array
  if (!shippingCountryLookup[code]) {
    shippingCountryLookup[code] = {
      shippingNote: restOfWorldNote,
      shipping: restOfWorldAmount,
    };
  }

});


module.exports = shippingCountryLookup;

