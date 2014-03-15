module.exports = {
    'single': {
        source: [ 'yql' ],
        upstream: {
            components: [
                'get',
                'jsonp',
                'oop',
                'yql',
                'yui'
            ],
            modules: [
                'get',
                'jsonp',
                'jsonp-url',
                'oop',
                'yql',
                'yql-jsonp',
                'yql-nodejs',
                'yql-winjs',
                'yui-base'
            ]
        },
        downstream: {
            components: [
                'autocomplete',
                'yql'
            ],
            modules: [
                'autocomplete-base',
                'autocomplete-list',
                'autocomplete-list-keys',
                'autocomplete-plugin',
                'autocomplete-sources',
                'yql'
            ]
        }
    },
    'circular': {
        source: [ 'a' ],
        upstream: { components: [], modules: [ 'a', 'b', 'c' ] },
        downstream: { components: [], modules: [ 'a', 'b', 'c' ] }
    },
    'rollup': {
        source: [ 'a' ],
        upstream: { components: [], modules: [ 'a', 'c' ] },
        downstream: { components: [], modules: [ 'a' ] }
    },
    'optional': {
        source: [ 'a' ],
        upstream: { components: [], modules: [ 'a', 'b', 'c' ] },
        downstream: { components: [], modules: [ 'a' ] }
    },
    'conditional': {
        source: [ 'a' ],
        upstream: { components: [], modules: [ 'a', 'b' ] },
        downstream: { components: [], modules: [ 'a' ] }
    },
    'component': {
        source: [ 'a', 'c' ],
        upstream: { components: ['x', 'y'], modules: [ 'a', 'b', 'c' ] },
        downstream: { components: ['y'], modules: [ 'a', 'c' ] }
    },
    'componentSource': {
        source: [ 'a', 'b', 'c' ],
        upstream: { components: ['x', 'y'], modules: [ 'a', 'b', 'c' ] },
        downstream: { components: ['x', 'y'], modules: [ 'a', 'b', 'c' ] }
    },
    'multiple': {
        source: [
            'yql',
            'scrollview'
        ],
        upstream: {
            components: [
                'attribute',
                'base',
                'classnamemanager',
                'color',
                'dom',
                'event',
                'event-custom',
                'event-gestures',
                'get',
                'jsonp',
                'node',
                'oop',
                'plugin',
                'pluginhost',
                'scrollview',
                'transition',
                'widget',
                'yql',
                'yui'
            ],
            modules: [
                'attribute-base',
                'attribute-complex',
                'attribute-core',
                'attribute-extras',
                'attribute-observable',
                'base-base',
                'base-core',
                'base-observable',
                'base-pluginhost',
                'classnamemanager',
                'color-base',
                'dom-base',
                'dom-core',
                'dom-style',
                'dom-style-ie',
                'event-base',
                'event-base-ie',
                'event-custom-base',
                'event-custom-complex',
                'event-delegate',
                'event-flick',
                'event-focus',
                'event-mousewheel',
                'event-move',
                'event-synthetic',
                'event-touch',
                'features',
                'get',
                'jsonp',
                'jsonp-url',
                'node-base',
                'node-core',
                'node-event-delegate',
                'node-style',
                'oop',
                'plugin',
                'pluginhost-base',
                'pluginhost-config',
                'scrollview',
                'scrollview-base',
                'scrollview-base-ie',
                'scrollview-scrollbars',
                'selector',
                'selector-css2',
                'selector-native',
                'transition',
                'transition-timer',
                'widget-base',
                'widget-base-ie',
                'widget-htmlparser',
                'widget-skin',
                'widget-uievents',
                'yql',
                'yql-jsonp',
                'yql-nodejs',
                'yql-winjs',
                'yui-base'
            ]
        },
        downstream: {
            components: [
                'autocomplete',
                'scrollview',
                'yql'
            ],
            modules: [
                'autocomplete-base',
                'autocomplete-list',
                'autocomplete-list-keys',
                'autocomplete-plugin',
                'autocomplete-sources',
                'scrollview',
                'yql'
            ]
        }
    }
};
