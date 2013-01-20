all: node-modules

node-modules:
	npm install
	npm prune

jshint:
	node_modules/.bin/jshint --config config/jshint-node.json src/ test/

test: node-modules jshint
	 mocha

PHONY: node-modules test jshint
