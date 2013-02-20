/* JSLint */
/*global jelly,Jelly,describe,it,beforeEach, expect, spyOn, dump, use*/

describe('jelly-mock.js', function () {
    'use strict';

    beforeEach(function () {
        jelly.reset();
    });

    it('should mock traits', function () {
        jelly.trait('Foo', function (def) {
            def.foo = 'bar';
        });

        jelly.mock.trait('Foo', function (def) {
            def.foo = 'mock';
        });

        jelly.trait('Bar', function (def) {
            def.bar = 'baz';
        });


        jelly.mock.enable();

        expect(jelly.include({}, 'Foo').foo).toBe('mock');
        expect(jelly.include({}, 'Bar').bar).toBe('baz');

        jelly.mock.disable();

        expect(jelly.include({}, 'Foo').foo).toBe('bar');
        expect(jelly.include({}, 'Bar').bar).toBe('baz');

    });

    it('should mock module', function () {
        jelly.module('Foo', function (def) {
            def.foo = 'bar';
        });

        jelly.mock.module('Foo', function (def) {
            def.foo = 'mock';
        });

        jelly.module('Bar', function (def) {
            def.bar = 'baz';
        });


        jelly.mock.enable();

        expect(jelly.module('Foo').foo).toBe('mock');
        expect(jelly.module('Bar').bar).toBe('baz');

        jelly.mock.disable();

        expect(jelly.module('Foo').foo).toBe('bar');
        expect(jelly.module('Bar').bar).toBe('baz');

    });

});
