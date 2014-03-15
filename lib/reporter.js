/*
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

/*jshint latedef:false */

/**
 * Writes a dependency tree to the console
 *
 * @method toConsole
 * @param {Object} depTree
 * @static
**/
module.exports = function (depTree, options) {
	var writer = options.writer,
		output;

	if (!options.json) {
		output = treeify(depTree);
	}
	else {
		output = JSON.stringify(depTree, null, 4);
	}

	writer(output);
};

function treeify (depTree) {
	var output = [];

	output.push('');
	depTree.upstream.components.forEach(function (v, i) {
		output.push('           ' + ((i === 0) ? '┌' : '├') + '─ ' + v);
	});

	output.push('      ┌─── Components (' + depTree.upstream.components.length + ')');
	output.push('      |');
	output.push('      |');

	depTree.upstream.modules.forEach(function (v, i) {
		output.push('      |    ' + ((i === 0) ? '┌' : '├') + '─ ' + v);
	});

	output.push('      ├─── Modules (' + depTree.upstream.modules.length + ')');
	output.push('      |');

	output.push('      |');

	output.push(' ┌─── Upstream');
	output.push(' |');
	output.push(' |');
	output.push(' |');

	output.push(' ├─ Source(s): ' + depTree.source.sort().join(', ') + '');

	output.push(' |');
	output.push(' |');
	output.push(' |');
	output.push(' └─── Downstream');
	output.push('      |');
	output.push('      |');
	output.push('      ├─── Modules (' + depTree.downstream.modules.length + ')');

	depTree.downstream.modules.forEach(function (v, i, a) {
		output.push('      |    ' + (((i+1) === a.length) ? '└' : '├') + '─ ' + v);
	});

	output.push('      |');
	output.push('      |');
	output.push('      └─── Components (' + depTree.downstream.components.length + ')');

	depTree.downstream.components.forEach(function (v, i, a) {
		output.push('           ' + (((i+1) === a.length) ? '└' : '├') + '─ ' + v);
	});

	output.push('');

	return output.join('\n');
}
