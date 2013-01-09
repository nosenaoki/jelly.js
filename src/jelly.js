/*jslint */
/*indent: 4, maxerr: 50 */

var jelly = jelly || (function () {
    'use strict';
    var MODULE = 'module',
        TRAIT = 'trait',
        factories = {},
        cache = {},
        plugins = {},
        def = {},
        dependencyStack = [];

    function inArray(needle, haystack) {
        var i;
        for (i = 0; i < haystack.length; i += 1) {
            if (needle === haystack[i]) {
                return true;
            }
        }
        return false;
    }

    function include(target, ns, type, args) {
        var rv, i, factory;

        if ((typeof ns) === 'function') {
            factory = {
                type: type,
                impl: ns
            };
        } else {
            if (!factories[ns]) {
                throw {
                    name: 'TypeNotFoundError',
                    message : 'the type "' + ns + '"is not registered'
                };
            }

            factory = factories[ns];
        }

        if (type && factory.type !== type) {
            throw {
                name: 'TypeInitializationError',
                message : ns + ' cannot be initialized as ' + type
            };
        }

        if (inArray(ns, dependencyStack)) {
            dependencyStack.push(ns);
            throw new Error('cyclic dependency found: ' + dependencyStack.join('->'));
        }
        dependencyStack.push(ns);
        def = {};

        rv = factory.impl(target);

        if (!rv) {
            rv = target;
        }

        if (plugins[ns]) {
            for (i = 0; i < plugins[ns].length; i += 1) {
                plugins[ns][i](rv);
            }
        }

        dependencyStack.pop();

        if ((typeof rv.initialize) ===  'function') {
            if (args) {
                rv.initialize.apply(rv, args);
            } else {
                rv.initialize();
            }
        }
        return rv;
    }

    function use(ns) {
        var target,
            rv,
            i;

        if (!cache[ns]) {
            target = {};
            cache[ns] = include(target, ns, MODULE);
        }

        return cache[ns];
    }

    def.module = function (ns, callback) {
        if (callback) {
            factories[ns] = {
                type: MODULE,
                impl : callback
            };
        } else {
            return use(ns);
        }

    };

    def.trait = function (ns, callback) {
        factories[ns] = {
            type: TRAIT,
            impl : callback
        };
    };

    def.include = function (target, name, args) {
        var tgt = target,
            n = name;

        if ((typeof tgt) === 'string') {
            tgt = use(tgt);
        }

        return include(tgt, n, TRAIT, args);
    };

    def.reset = function () {
        cache = {};
    };

    def.plugin = function (name, fn) {
        if (!plugins[name]) {
            plugins[name] = [];
        }

        plugins[name].push(fn);
    };

    return def;
}());
