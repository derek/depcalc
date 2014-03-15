#!/bin/sh

./node_modules/.bin/istanbul cover \
	--print both vows -- \
	tests/*.js --spec
