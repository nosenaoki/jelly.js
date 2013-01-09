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

    function include(target, name, type, args) {
        var result, i, factory;

        if (!factories[name]) {
            throw {
                name: 'TypeNotFoundError',
                message : 'the type "' + name + '"is not registered'
            };
        }

        factory = factories[name];

        if (type && factory.type !== type) {
            throw {
                name: 'TypeInitializationError',
                message : name + ' cannot be initialized as ' + type
            };
        }

        if (inArray(name, dependencyStack)) {
            dependencyStack.push(name);
            throw new Error('cyclic dependency found: ' + dependencyStack.join('->'));
        }
        dependencyStack.push(name);
        def = {};

        result = factory.impl(target);

        if (!result) {
            result = target;
        }

        if (plugins[name]) {
            for (i = 0; i < plugins[name].length; i += 1) {
                plugins[name][i](result);
            }
        }

        dependencyStack.pop();

        if ((typeof result.initialize) ===  'function') {
            if (args) {
                result.initialize.apply(result, args);
            } else {
                result.initialize();
            }
        }
        return result;
    }

    function use(name) {
        var target,
            i;

        if (!cache[name]) {
            target = {};
            cache[name] = include(target, name, MODULE);
        }

        return cache[name];
    }

    def.module = function (name, callback) {
        if (callback) {
            factories[name] = {
                type: MODULE,
                impl : callback
            };
        } else {
            return use(name);
        }

    };

    def.trait = function (name, callback) {
        factories[name] = {
            type: TRAIT,
            impl : callback
        };
    };

    def.include = function (target, name, args) {
        var tgt = target;

        if ((typeof tgt) === 'string') {
            tgt = use(tgt);
        }

        return include(tgt, name, TRAIT, args);
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
