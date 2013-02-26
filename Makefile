all: node-modules

node-modules:
	npm install
	npm prune

jshint:
	node_modules/.bin/jshint --config config/jshint-node.json *.js src/ test/

test: node-modules jshint
	 mocha

test-update:
	OVERWRITE_TESTS=1 make test

PHONY: node-modules test jshint test-update
