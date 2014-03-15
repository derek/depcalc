/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

/* jshint newcap: false */
"use strict";

var vows = require('vows'),
    path = require('path'),
    assert = require('assert'),
    Calculator = require('depcalc'),
    utilities = Calculator.utilities,
    results = require('./assets/results'),
    moduleMap = require('./assets/yui3.json'),
    componentMap = utilities.generateComponentMap(path.resolve(__dirname, 'assets/build-meta/*.json')),
    YUIConfig = {
        componentMap: componentMap,
        moduleMap: moduleMap
    };

var tests = {
    'The Calculator class': {
        topic: function () {
            return Calculator;
        },
        'instantiated should contain a resolve method': function (topic) {
            var instance = new topic();
            assert.isFunction(instance.resolve);
        },
        'and resolution against nothing': {
            topic: function (topic) {
                var calculator = new topic(YUIConfig);
                return calculator.resolve();
            },
            'should throw an error' : function (topic) {
                assert.throws(topic, Error);
            }
        },
        'and resolution on a non-existent module': {
            topic: function (topic) {
                var calculator = new topic({moduleMap:[]});
                return calculator.resolve('foo');
            },
            'should throw an error' : function (topic) {
                assert.throws(topic, Error);
            }
        },
        'and resolution for YUI': {
            'topic': function (topic) {
                return new topic(YUIConfig);
            },
            'on a single module': {
                topic: function (topic) {
                    return topic.resolve('yql');
                },
                'should relay the sources correctly' : function (topic) {
                    assert.deepEqual(topic.source, results.single.source);
                },
                'should calculate upstream components correctly' : function (topic) {
                    assert.deepEqual(topic.upstream.components, results.single.upstream.components);
                },
                'should calculate upstream modules correctly' : function (topic) {
                    assert.deepEqual(topic.upstream.modules, results.single.upstream.modules);
                },
                'should calculate downstream components correctly' : function (topic) {
                    assert.deepEqual(topic.downstream.components, results.single.downstream.components);
                },
                'should calculate downstream modules correctly' : function (topic) {
                    assert.deepEqual(topic.downstream.modules, results.single.downstream.modules);
                }
            },
            'and on multiple sources': {
                topic: function (topic) {
                    return topic.resolve(['yql', 'scrollview']);
                },
                'should relay the sources correctly' : function (topic) {
                    assert.deepEqual(topic.source, results.multiple.source);
                },
                'should calculate upstream components correctly' : function (topic) {
                    assert.deepEqual(topic.upstream.components, results.multiple.upstream.components);
                },
                'should calculate upstream modules correctly' : function (topic) {
                    assert.deepEqual(topic.upstream.modules, results.multiple.upstream.modules);
                },
                'should calculate downstream components correctly' : function (topic) {
                    assert.deepEqual(topic.downstream.components, results.multiple.downstream.components);
                },
                'should calculate downstream modules correctly' : function (topic) {
                    assert.deepEqual(topic.downstream.modules, results.multiple.downstream.modules);
                }
            }
        },
        'and circular resolution': {
            topic: function (topic) {
                var calculator = new topic({
                    moduleMap: {
                        a: {
                            requires: ['b']
                        },
                        b: {
                            requires: ['c']
                        },
                        c: {
                            requires: ['a']
                        }
                    }
                });

                return calculator.resolve(['a']);
            },
            'should relay the sources correctly' : function (topic) {
                assert.deepEqual(topic.source, results.circular.source);
            },
            'should calculate upstream components correctly' : function (topic) {
                assert.deepEqual(topic.upstream.components, results.circular.upstream.components);
            },
            'should calculate upstream modules correctly' : function (topic) {
                assert.deepEqual(topic.upstream.modules, results.circular.upstream.modules);
            },
            'should calculate downstream components correctly' : function (topic) {
                assert.deepEqual(topic.downstream.components, results.circular.downstream.components);
            },
            'should calculate downstream modules correctly' : function (topic) {
                assert.deepEqual(topic.downstream.modules, results.circular.downstream.modules);
            }
        },
        'and optional resolution': {
            topic: function (topic) {
                var calculator = new topic({
                    moduleMap: {
                        a: {
                            requires: ['b']
                        },
                        b: {
                            optional: ['c']
                        },
                        c: {
                            optional: ['b']
                        }
                    }
                });

                return calculator.resolve(['a']);
            },
            'should relay the sources correctly' : function (topic) {
                assert.deepEqual(topic.source, results.optional.source);
            },
            'should calculate upstream components correctly' : function (topic) {
                assert.deepEqual(topic.upstream.components, results.optional.upstream.components);
            },
            'should calculate upstream modules correctly' : function (topic) {
                assert.deepEqual(topic.upstream.modules, results.optional.upstream.modules);
            },
            'should calculate downstream components correctly' : function (topic) {
                assert.deepEqual(topic.downstream.components, results.optional.downstream.components);
            },
            'should calculate downstream modules correctly' : function (topic) {
                assert.deepEqual(topic.downstream.modules, results.optional.downstream.modules);
            }
        },
        'and rollup resolution': {
            topic: function (topic) {
                var calculator = new topic({
                    moduleMap: {
                        a: {
                            requires: ['b']
                        },
                        b: {
                            use: ['c']
                        },
                        c: {
                            requires: ['d']
                        },
                        d: {
                            use: ['c']
                        }
                    }
                });

                return calculator.resolve(['a']);
            },
            'should relay the sources correctly' : function (topic) {
                assert.deepEqual(topic.source, results.rollup.source);
            },
            'should calculate upstream components correctly' : function (topic) {
                assert.deepEqual(topic.upstream.components, results.rollup.upstream.components);
            },
            'should calculate upstream modules correctly' : function (topic) {
                assert.deepEqual(topic.upstream.modules, results.rollup.upstream.modules);
            },
            'should calculate downstream components correctly' : function (topic) {
                assert.deepEqual(topic.downstream.components, results.rollup.downstream.components);
            },
            'should calculate downstream modules correctly' : function (topic) {
                assert.deepEqual(topic.downstream.modules, results.rollup.downstream.modules);
            }
        },
        'and conditional resolution': {
            topic: function (topic) {
                var calculator = new topic({
                    moduleMap: {
                        a: {},
                        b: {
                            condition: {
                                name: 'b',
                                trigger: 'a'
                            }
                        }
                    }
                });

                return calculator.resolve(['a']);
            },
            'should relay the sources correctly' : function (topic) {
                assert.deepEqual(topic.source, results.conditional.source);
            },
            'should calculate upstream components correctly' : function (topic) {
                assert.deepEqual(topic.upstream.components, results.conditional.upstream.components);
            },
            'should calculate upstream modules correctly' : function (topic) {
                assert.deepEqual(topic.upstream.modules, results.conditional.upstream.modules);
            },
            'should calculate downstream components correctly' : function (topic) {
                assert.deepEqual(topic.downstream.components, results.conditional.downstream.components);
            },
            'should calculate downstream modules correctly' : function (topic) {
                assert.deepEqual(topic.downstream.modules, results.conditional.downstream.modules);
            }
        },
        'and component references': {
            topic: function (topic) {
                var calculator = new topic({
                    componentMap: {
                        'x': ['b'],
                        'y': ['c']
                    },
                    moduleMap: {
                        a: {
                            requires: 'b'
                        },
                        b: {},
                        c: {},
                    }
                });

                return calculator.resolve(['a', 'c']);
            },
            'should relay the sources correctly' : function (topic) {
                assert.deepEqual(topic.source, results.component.source);
            },
            'should calculate upstream components correctly' : function (topic) {
                assert.deepEqual(topic.upstream.components, results.component.upstream.components);
            },
            'should calculate upstream modules correctly' : function (topic) {
                assert.deepEqual(topic.upstream.modules, results.component.upstream.modules);
            },
            'should calculate downstream components correctly' : function (topic) {
                assert.deepEqual(topic.downstream.components, results.component.downstream.components);
            },
            'should calculate downstream modules correctly' : function (topic) {
                assert.deepEqual(topic.downstream.modules, results.component.downstream.modules);
            }
        },
        'and resolutions with component sources enabled': {
            topic: function (topic) {
                var calculator = new topic({
                    componentSource: true,
                    componentMap: {
                        'x': ['a', 'b'],
                        'y': ['c']
                    },
                    moduleMap: {
                        a: {},
                        b: {},
                        c: {},
                    }
                });

                return calculator.resolve(['x', 'y']);
            },
            'should relay the sources correctly' : function (topic) {
                assert.deepEqual(topic.source, results.componentSource.source);
            },
            'should calculate upstream components correctly' : function (topic) {
                assert.deepEqual(topic.upstream.components, results.componentSource.upstream.components);
            },
            'should calculate upstream modules correctly' : function (topic) {
                assert.deepEqual(topic.upstream.modules, results.componentSource.upstream.modules);
            },
            'should calculate downstream components correctly' : function (topic) {
                assert.deepEqual(topic.downstream.components, results.componentSource.downstream.components);
            },
            'should calculate downstream modules correctly' : function (topic) {
                assert.deepEqual(topic.downstream.modules, results.componentSource.downstream.modules);
            }
        }
    }
};

vows.describe('main').addBatch(tests).export(module);
