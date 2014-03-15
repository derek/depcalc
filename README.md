# YUI Dependency Calculator

depcalc is a Node.js tool that will calculate upstream and downstream
YUI components and modules.  The tool includes an API (`require('yiu-dep-calc')`), a command-line tool (`ydc`), as well as a [Yogi](https://github.com/yui/yogi) plugin (`yogi depcalc`).

## Demo
    $ ydc yql
               ┌─ get
               ├─ jsonp
               ├─ oop
               ├─ yql
               ├─ yui
          ┌─── Components (5)
          |
          |
          |    ┌─ get
          |    ├─ jsonp
          |    ├─ jsonp-url
          |    ├─ oop
          |    ├─ yql
          |    ├─ yql-jsonp
          |    ├─ yql-nodejs
          |    ├─ yql-winjs
          |    ├─ yui-base
          ├─── Modules (9)
          |
          |
     ┌─── Upstream
     |
     |
     |
     ├─ Source(s): yql
     |
     |
     |
     └─── Downstream
          |
          |
          ├─── Modules (6)
          |    ├─ autocomplete-base
          |    ├─ autocomplete-list
          |    ├─ autocomplete-list-keys
          |    ├─ autocomplete-plugin
          |    ├─ autocomplete-sources
          |    └─ yql
          |
          |
          └─── Components (2)
               ├─ autocomplete
               └─ yql



## API
Check out [bin/cli.js](bin/cli.js) for an example of how to use depcalc's API.

## FAQ
### What are is the difference between "upstream" and "downstream"?
 * Downstream dependencies are ones that depend on your specified module(s) for functionality.
 * Upstream dependencies are ones that your module(s) depend on for functionality.  This is what [Loader](http://yuilibrary.com/yui/docs/loader) provides.

### Are there any advantages over Loader?
 * This tool will calculate downstream dependencies.  Loader only goes *up*.
 * Includes **all** conditionally loaded modules, not just the modules specific to your UA.
 * No dependency for YUI in your Node.js application.
 * Can reference a custom dependency tree (as opposed to [yui3.json](https://github.com/yui/yui3/blob/master/src/loader/js/yui3.json)).

### How does depcalc handle rollups?
 * Rollups are modules which `use` other modules and don't provide any direct capabilities themselves.  In other words, they are pointers to a list of other modules.  depcalc will follow the trail through rollup modules, but not include the rollup itself in the up/downstream list of modules.

### How is this useful?
 * You can use it to calculate downstream modules to only run CI tests applicable to code that has changed since last push.
 * Could be used for [dependency visualization](http://derek.github.io/sandbox/yui/viz/index.html)
 * Could be used to create a server-side [Configurator](https://yuilibrary.com/yui/configurator/).
