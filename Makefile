all: node-modules

jshint:
	node_modules/.bin/jshint --config config/jshint-node.json *.js src/ test/

ifdef TRAVIS
  MOCHA_ARGS = --reporter tap
endif

test: jshint
	mocha $(MOCHA_ARGS)

test-update:
	OVERWRITE_TESTS=1 make test

PHONY: node-modules test jshint test-update
