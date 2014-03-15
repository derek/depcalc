/*
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

/*jshint onevar:false */

var glob = require('glob');

/**
 * Removes duplicates values in an array
 *
 * @method dedupe
 * @param {Array} The input array
 * @return {Array}
 * @static
 */
module.exports.dedupe = function (arr) {
    return arr.filter(function (v, i, a) {
        return a.indexOf(v) === i;
    });
};

/**
 * Flattens an array
 *
 * @method flatten
 * @param {Array} The input array
 * @return {Array}
 * @static
 */
module.exports.flatten = function (arr) {
	return Array.prototype.concat.apply([], arr);
};

/**
  * Generates the hash table of modules <-> components
  *
  * @method _computeComponentMap
  * @private
  */
module.exports.generateComponentMap = function (globStr) {
    var buildPaths = glob.sync(globStr);
    var components = {};
    var component;
    var meta;

    // Generate a map of module -> component
    buildPaths.forEach(function (p) {
        meta = require(p);
        component = meta.name;

        Object.keys(meta.builds).forEach(function (module) {
            if (!components[component]) {
                components[component] = [];
            }

            components[component].push(module);
        });
    });

    Object.keys(components).forEach(function (component) {
        components[component].sort();
    });

    return components;
};