# LinkToBooks Price Fetchers

This repository contains the code that is used to fetch the price and other
information for a particular book from a particular vendor.

How the price is fetched varies from an API call to scraping the vendor's
website.

The extracted information is returned in a standard form that can then be
cleaned up as needed.


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