/* JSLint */
/*global jelly,Jelly,describe,it, expect, spyOn, dump, use*/

describe('jelly-mock.js', function () {
    'use strict';

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
});
