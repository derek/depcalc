#!/usr/bin/env node

/*
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

/*jshint latedef:false, onevar:false */
var nopt = require('nopt');
var path = require('path');
var parsedArgs = nopt({
    'json' : Boolean,
    'yuipath': path,
    'help': Boolean,
    'component': Boolean
}, null, process.argv, 2);

var componentSource = (parsedArgs.component || false);
var yogiPath = process.env.YOGI_PATH;

// If this was executed via Yogi, introduce some Yogi-specific variables
if (yogiPath) {
    var yogiGit = require(path.join(yogiPath, 'lib/git'));
    var yogiUtil = require(path.join(yogiPath, 'lib/util'));
    var yogiYUIRoot = path.join(yogiGit.findRoot(), '..');
    var yogiComponent = yogiUtil.findModule(true).name;
    componentSource = true;
}

if (parsedArgs.help) {
    console.log('This is Help.  Will be populated with more details soon.');
    process.exit();
}

// IIFE to kick off the main() portion of the app
(function () {

    var Calculator = require('../lib/index');
    var YDCUtils = require('../lib/utilities');
    var depTree;
    var yuipath;
    var modules;
    var moduleMap;
    var componentMap;
    var YUICalculator;

    yuipath = findYUI();

    if (!yuipath) {
        throw new Error('Please specify the path to your YUI repo with --yuipath, or set a $YUI3_PATH environment variable.');
    }

    modules = getModules();

    if (modules.length === 0) {
        throw new Error('No modules specified');
    }

    moduleMap = require(path.resolve(yuipath, 'src/loader/js/yui3.json'));
    componentMap = YDCUtils.generateComponentMap(path.resolve(yuipath, 'src/*/build.json'));

    // Intantiate a new Calculator object, loaded with YUI data
    YUICalculator = new Calculator({
        moduleMap: moduleMap,
        componentMap: componentMap,
        componentSource: componentSource
    });

    // Calculate the dependency tree for the given module(s)
    depTree = YUICalculator.resolve(modules);

    // Handle the result
    handleResult(depTree);
}());

function getModules () {
    var fs = require('fs');

    // First try to get the modules via STDIN (if neccesary)
    if (parsedArgs.stdin) {
        // Todo: Support for Windows
        return fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/[\n|\s]/);
    }

    // Next, look at argv
    else if (parsedArgs.argv.remain.length > 0) {
        return parsedArgs.argv.remain;
    }

    // Maybe we're in Yogi?
    else if (yogiPath) {
        return yogiComponent;
    }

    // Finally, just return an empty array, which will generate an error
    else {
        return [];
    }
}

function findYUI () {
    // First, if this is in Yogi, Yogi knows
    if (yogiPath) {
        return yogiYUIRoot;
    }

    // Next, look for an env variable
    else if (process.env.YUI3_PATH) {
        return process.env.YUI3_PATH;
    }

    // Maybe it's on argv?
    else if (parsedArgs.yuipath) {
        return parsedArgs.yuipath;
    }

    // Unable to detect a path to the YUI3 repo, which will generate an error
    else {
        return false;
    }
}

function handleResult (depTree) {
    var reporter = require('../lib/reporter');

    reporter(depTree, {
        writer: console.log,
        json: parsedArgs.json
    });
}
