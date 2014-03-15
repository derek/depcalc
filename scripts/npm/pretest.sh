#!/bin/sh

./node_modules/.bin/jshint \
 	--config ./node_modules/yui-lint/jshint.json \
	./lib/*.js ./bin/*.js ./tests/*.js