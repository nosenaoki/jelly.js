/*jslint */
/*indent: 4, maxerr: 50 */

var jelly = jelly || (function () {
    'use strict';
    var MODULE = 'module',
        TRAIT = 'trait',
        PROP_INCLUDES = '__includes',
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

    function include(target, name, type) {
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

    def.include = function (target, name) {
        var tgt = target;

        if ((typeof tgt) === 'string') {
            tgt = use(tgt);
        }

        if (!tgt[PROP_INCLUDES]) {
            tgt[PROP_INCLUDES] = {};
        }

        if (!tgt[PROP_INCLUDES][name]) {
            tgt[PROP_INCLUDES][name] = 1;
            return include(tgt, name, TRAIT);
        }
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

jelly.mock = (function () {
    'use strict';

    var traits = {},
        modules = {},
        moduleInstances = {},
        moduleFunction = jelly.module,
        includeFunction = jelly.include;

    return {
        trait: function (name, obj) {
            traits[name] = obj;
        },
        module: function (name, callback) {
            modules[name] = callback;
        },
        enable: function () {
            jelly.include = function (obj, name) {
                var ret;
                if (traits[name]) {
                    traits[name](obj);
                    ret = obj;
                } else {
                    ret = includeFunction(obj, name);
                }
                return ret;
            };

            jelly.module = function (name, callback) {
                var ret;

                if (!callback && modules[name]) {
                    if (moduleInstances[name]) {
                        ret = moduleInstances[name];
                    } else {
                        ret = {};
                        modules[name](ret);
                        moduleInstances[name] = ret;
                    }

                } else {
                    ret = moduleFunction(name, callback);
                }
                return ret;
            };
        },
        disable: function () {
            jelly.include = includeFunction;
            jelly.module = moduleFunction;
        },
        reset: function () {
            moduleInstances = {};
        }
    };
}());
