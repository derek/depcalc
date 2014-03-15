/*
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

/**
  * Provides the top-level API
  *
  * Usage
  * -----
  *
  *     var Calculator = require('depcalc');
  *
  * @module depcalc
  */

/*jshint onevar:false */
var utilities = require('./utilities');
var dedupe = utilities.dedupe;
var flatten = utilities.flatten;

/**
  * The Calculator class provides the ability to calculate dependencies
  * for a given set of modules.  The result object contains the
  * upstream and downstream modules and components.
  *
  *
  * Usage
  * -----
  *
  *     var Calculator = require('depcalc');
  *     var myCalc = new Calculator({
  *         moduleMap: {
  *             a: {
  *                 requires: ['b']
  *             },
  *             b: {
  *                 use: ['c']
  *             },
  *             c: {
  *                 requires: ['d'],
  *                 optional: ['e']
  *             },
  *             d: {},
  *             e: {}
  *         },
  *         componentMap: {
  *             componentAB: ['a', 'b'],
  *             componentCD: ['c', 'd'],
  *             componentE:  ['e']
  *         }
  *     });
  *
  *     var dependencyTree = myCalc.resolve('c');
  *
  *     console.log(dependencyTree);
  *
  *         // Results
  *         {
  *             "source": [
  *                 "c"
  *             ],
  *             "upstream": {
  *                 "components": [
  *                     "componentCD",
  *                     "componentE"
  *                 ],
  *                 "modules": [
  *                     "c",
  *                     "d",
  *                     "e"
  *                 ]
  *             },
  *             "downstream": {
  *                 "components": [
  *                     "componentAB",
  *                     "componentCD"
  *                 ],
  *                 "modules": [
  *                     "a",
  *                     "c"
  *                 ]
  *             }
  *         }
  *
  * To instantiate a YUI calculator
  *
  *     var Calculator = require('depcalc');
  *     var utilities = Calculator.utilities;
  *
  *     var yuiCalc = new Calculator({
  *         moduleMap: require('path/to/yui3/src/loader/js/yui3.json'),
  *         componentMap: utilities.generateComponentMap('path/to/yui3/src/ * /build.json')
  *     });
  *
  *     yuiCalc.resolve(['yql', 'widget']);
  *
  * Terminology
  * -----------
  * * **"Modules"** are units of functionality that expose a single API.
  *
  * * **"Components"** are logical groupings of one or more modules.
  *
  * * **"Upstream"** refers to dependencies that are required for proper
  *   functionality.  For example, YUI's `node` module is upstream of
  *   the `Widget` module, because `Widget` requires `node` for
  *   DOM manipulation.
  *
  * * **"Downstream"** is the opposite of "upstream", and refers to
  *   dependencies that a module provides functionality for.
  *   For example, if `moduleA` is considered **upstream** of `moduleB`,
  *   then `moduleB` is considered **downstream** of `moduleA`.
  *
  * Module Maps
  * -----------
  * Each item in module map can contain any combination of
  * the following values:
  *
  * * `requires` - Dependencies that provide required functionality.
  * These are calculated to be a dependent.
  *
  * * `optional` - Dependencies that provide optional functionality.
  * These are calculated to be a dependent.
  *
  * * `use` - Used by "rollup modules" to alias other modules (or rollups).
  * These are **not included** in the final list of dependencies, but their children
  * are included (*as long as they aren't rollups themselves*).
  *
  * * `condition` - Conditionally loaded modules.  If the `trigger` value is
  * calculated as a dependency, the `name` value will be included as
  * a new dependency.
  *
  * For example:
  *
  *     'A': {
  *         requires: ['B', 'C'],
  *         optional: ['D'],
  *         use: ['E', 'F'],
  *         condition: {
  *              name: 'A'
  *              trigger: 'G'
  *         }
  *     }
  *
  *
  * Component Maps
  * -----------
  * A component map is a hash table of components and an array of modules
  * that each contains.
  *
  * For example:
  *
  *     {
  *         component1: ['moduleA', 'moduleB'],
  *         component2: ['moduleC', 'moduleD', 'moduleE']
  *     }
  *
  *
  * @class Calculator
  * @constructor
  * @public
  * @param {Object} config A configuration object
  * @param {Object} config.moduleMap A module map
  * @param {Object} [config.componentMap] A component map
  */

function Calculator (config) {
    config = (config || {});

    // Ideas for additional config options:
    //   - include optional deps?
    //   - include rollups?
    //   - conditional module inclusions (`-ie`, `-nodejs`)
    //   -

    /**
      * @property _moduleMap
      * @private
      */
    this._moduleMap = config.moduleMap;

    /**
      * A hash table of modules <-> components.  This data is derived from
      * the build paths configuration array.
      *
      * @property componentMap
      * @private
      */
    this._componentMap = config.componentMap || false;

    /**
      * A hash table of module <-> rollup.
      *
      * @property rollupMap
      * @private
      */
    this._rollupMap = null;

    /**
      * @property componentSources
      * @private
      */
    this._componentSource = config.componentSource || false;

    // Pre-compute some lookup tables
    this._computeRollupMap();
}

/**
  * Calculates the dependency tree for the given modules.
  *
  * Usage
  * -----
  *     var tree1 = calculator.resolve('moduleA');
  *     var tree2 = calculator.resolve(['moduleB', 'moduleC']);
  *
  * @method resolve
  * @public
  * @param {String|Array} modules A single module, or an array of
  *     modules to be calculated
  * @return {Object} The dependency tree
  */
Calculator.prototype.resolve = function resolve (modules) {

    if (!modules) {
        throw new Error('No modules specified');
    }

    if (typeof modules !== 'object') {
        modules = [modules];
    }

    var componentMap = this._componentMap,
        tree = {
            source: null,
            upstream: {
                components: [],
                modules: []
            },
            downstream: {
                components: [],
                modules: []
            }
        };

    // If the componentSources flag is set, loop through each input source
    // and concat that component's modules.
    if (this._componentSource) {
        modules = modules.reduce(function(prev, curr){
            return prev.concat(componentMap[curr]);
        }, []);
    }

    tree.source = modules;

    tree.upstream.modules = this._getDependents(modules, {upstream: true});
    tree.downstream.modules = this._getDependents(modules, {upstream: false});

    if (this._componentMap) {
        tree.upstream.components = this._getComponentList(tree.upstream.modules);
        tree.downstream.components = this._getComponentList(tree.downstream.modules);
    }

    return tree;
};

/**
  * Generates the hash table of modules <-> components
  *
  * @method _computeComponentMap
  * @private
  */
Calculator.prototype._computeRollupMap = function _computeRollupMap () {
    var rollupMap = {};
    var moduleMap = this._moduleMap;

    if (moduleMap) {
        Object.keys(moduleMap).forEach(function (component) {
            if (moduleMap[component].use) {
                moduleMap[component].use.forEach(function (module) {
                    rollupMap[module] = component;
                });
            }
        });
    }

    this._rollupMap = rollupMap;
};

/**
  * Obtains the up and downstream dependents
  *
  * @method _getDependents
  * @private
  * @param {Array} modules The module to lookup dependents for
  * @param {Object} options Configration options
  * @param {Boolean} [options.upstream] Whether to look upstream (true) or downstream (false)
  */
Calculator.prototype._getDependents = function _getDependents (modules, options) {
    var self = this;
    var dependents;

    dependents = modules.map(function (m) {
        return self._walkDependencyTree(m, {upstream: options.upstream});
    });

    return dedupe(flatten(dependents)).sort();
};

/**
  * Obtains a list of components for a given set of modules
  *
  * @method _getComponentList
  * @private
  * @param {Array} modules The module to lookup a component for
  * @return {Array} Array of components
  */
Calculator.prototype._getComponentList = function _getComponentList (modules) {
    var componentMap = this._componentMap;
    var components = [];

    modules.forEach(function (module) {
        // Loop through each component, looking for the module.
        // TODO: Candidate for a lookup function to prevent duplicate lookups
        Object.keys(componentMap).forEach(function (component) {
            if (componentMap[component].indexOf(module) !== -1) {
                components.push(component);
            }
        });
    });

    return dedupe(components).sort();
};

/**
  * Obtain the upstream/downstream dependents for a given module.
  *
  * @method _walkDependencyTree
  * @private
  * @param {String} module The module to calculate dependencies for
  * @param {Object} options Configration options
  * @param {Boolean} options.upstream A flag to go upstream or downstream
  * @param {Array} [dependencies] An array of dependencies that is passed
  *        around through the recursive calls, and ultimately returned out.
  */
Calculator.prototype._walkDependencyTree = function _walkDependencyTree (module, options, dependencies) {

    /*
     * This is done by:
     *   1. Including any conditionally loaded modules
     *   2. Including any `requires` or `optional`
     *   3. Follow any rollups, but don't include them in the final list
     */

    var self = this;
    var moduleMap = self._moduleMap;
    var rollupMap = self._rollupMap;
    var newDependencies = [];
    var subtree = moduleMap[module];
    var upstream = options.upstream;

    dependencies = dependencies || [];

    // This is an invalid module
    if (!subtree) {
        return dependencies;
    }

    // Include any conditionally loaded modules
    // TODO: Pre-compute this map
    Object.keys(moduleMap).forEach(function (m) {
        if (moduleMap[m].condition && moduleMap[m].condition.trigger === module) {
            newDependencies.push(moduleMap[m].condition.name);
        }
    });
    // Include any dependecies list as required or optional
    if (upstream) {
        if (subtree.requires) {
            newDependencies = newDependencies.concat(subtree.requires);
        }
        if (subtree.optional) {
            newDependencies = newDependencies.concat(subtree.optional);
        }
    }
    else {
        // Loop through each component and see if it this module is a dependency
        // TODO: Could be improved by memoizing
        newDependencies = Object.keys(moduleMap).filter(function (m) {
            return newDependencies.concat(moduleMap[m].requires, moduleMap[m].optional).indexOf(module) !== -1;
        });
    }

    // If it's a rollup, include the modules in the rollup
    if (subtree.use) {
        newDependencies = newDependencies.concat(subtree.use);
    }
    // Otherwise include this module as a dependency
    else {
        dependencies.push(module);
    }

    // If we're looking downstream, and it's part of a rollup, but
    // not a rollup itself
    if (!upstream && rollupMap[module] && !subtree.use) {
        newDependencies = newDependencies.concat(rollupMap[module]);
    }

    // Get each of the new dependent's dependencies
    newDependencies.forEach(function (m) {
        // TODO: memoize
        if (dependencies.indexOf(m) === -1) {
            self._walkDependencyTree(m, {
                upstream: upstream,
            }, dependencies);
        }
    });

    return dependencies;
};

Calculator.utilities = utilities;
module.exports = Calculator;
