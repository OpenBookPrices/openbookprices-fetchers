# OpenBookPrices Price Fetchers

[![Build Status](https://secure.travis-ci.org/OpenBookPrices/l2b-price-fetchers.png)](http://travis-ci.org/OpenBookPrices/l2b-price-fetchers)

This repository contains the code that is used to fetch the price and other
information for a particular book from a particular vendor.

How the price is fetched varies from an API call to scraping the vendor's
website.

The extracted information is returned in a standard form that can then be
cleaned up as needed.

## Return format

The response is a hash, looking something like this:

``` json
{
  "args": {
    "country": "GB",
    "currency": "GBP",
    "isbn": "9780330508537",
    "vendor": "foyles"
  },
  "authors": [
    "Douglas Adams"
  ],
  "title": "The Hitchhiker's Guide to the Galaxy",
  "url": "http://www.foyles.co.uk/witem/fiction-poetry/the-hitchhikers-guide-to-the-galaxy,douglas-adams-9780330508537",
  "entries": [
    {
      "countries": [
        "GB"
      ],
      "currency": "GBP",
      "formats": {
        "new": {
          "availabilityNote": "Despatched in 1 business day.",
          "price": 5.83,
          "shipping": 2.5,
          "shippingNote": "Free second class delivery in the UK for orders over £10",
          "total": 8.33
        }
      },
      "isbn": "9780330508537",
      "timestamp": 1371993232,
      "ttl": 86400,
      "url": "http://www.foyles.co.uk/witem/fiction-poetry/the-hitchhikers-guide-to-the-galaxy,douglas-adams-9780330508537",
      "vendor": "foyles"
    },
    ...
  ]
}
```

### Guide to the keys

#### `authors` and `title`

Text. These fields are optional, but it is nice if they are included.

#### `entries`

Array. The `entries` array should contain an entry for each combination of
country and currency (note that `countries` is an array, as often lots of
countries will have the same price). The `availability` flag is true if the
vendor can supply this book, false otherwise. What `canSell` means is something
that each scrapers needs to determine, but generally `true` mean that they can
sell it, and `false` means they can (don't stock it, book not found on their
site, out of stock etc).

The 'shipping' and hence 'total' returned assume that you are only buying the
one book. The `shippingNote` should be used to clarify if there are discounts
to be had for buying more (as in the above example).

The `url` is to the page on the vendor's site for this book.

Note that the format is similar to, but different from, the format returned by
the [OpenBookPrices API](https://github.com/OpenBookPrices/openbookprices-api).

## Proxy

During development it is convenient to run a proxy that cache all requests so
that the time taken to run a scraper is much shorter, and it is politer to the
target site too.
[Polipo](http://www.pps.univ-paris-diderot.fr/~jch/software/polipo/) works well
for this:

``` bash
# install using your package manager of choice, in this case brew
brew install polipo

# run polipo in a separate terminal telling it to cache everything once fetched
polipo -- relaxTransparency=true logLevel=0xFF idleTime=1s

# in the terminal where you run the scripts set the env variable
export http_proxy=http://localhost:8123/

# When you want to clear the cache just delete the files (adapt to your system)
rm -r /usr/local/var/cache/polipo/*

```
