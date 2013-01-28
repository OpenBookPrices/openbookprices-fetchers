# LinkToBooks Price Fetchers

This repository contains the code that is used to fetch the price and other
information for a particular book from a particular vendor.

How the price is fetched varies from an API call to scraping the vendor's
website.

The extracted information is returned in a standard form that can then be
cleaned up as needed.

## Return format

The response is a hash, looking something like this:

```javascript
{
  "authors": [
    "Douglas Adams"
  ],
  "endTime": 1359384179847,
  "found": true,
  "prices": [
    {
      "amount": 5.59,
      "availability": true,
      "availabilityComment": "Despatched in 1 business day.",
      "condition": "new",
      "contries": [
        "GB"
      ],
      "currency": "GBP",
      "isbn": "9780330508537",
      "shipping": 2.5,
      "shippingComment": "Free delivery in the UK for orders over £10",
      "total": 8.09,
      "ttl": 86400,
      "url": "http://www.foyles.co.uk/witem/fiction-poetry/the-hitchhikers-guide-to-the-galaxy,douglas-adams-9780330508537",
      "validUntil": 1359470579,
      "vendor": "foyles"
    }
  ],
  "startTime": 1359384179481,
  "title": "The Hitchhiker's Guide to the Galaxy",
  "totalTime": 366,
  "url": "http://www.foyles.co.uk/witem/fiction-poetry/the-hitchhikers-guide-to-the-galaxy,douglas-adams-9780330508537"
}
```

The `authors` and `title` field are optional, but it is nice if they are
included. The `found` can be `true` or `false` - true meaning that the vendor
knows about this book.

The `prices` array should contain an entry for each combination of country and
currency (note that countries is an array, as often lots of countries will have
the same price). The `availability` flag is true if the vendor can supply this
book, false otherwise. What "can supply" means is something that each scrapers
needs to determine.

The 'shipping' and hence 'total' returned assume that you are only buying the
one book. The `shippingComment` should be used to clarify if there are discounts
to be had for buying more (as in the above example).

The `url` is where the specific link on the vendor's site for this book.

Note that the format is similar to, but different from, the format returned by
the LinkToBooks API.

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