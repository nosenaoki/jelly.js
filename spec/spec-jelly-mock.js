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

        jelly.mock.enable();

        expect(jelly.include({}, 'Foo').foo).toBe('mock');

        jelly.mock.disable();

        expect(jelly.include({}, 'Foo').foo).toBe('bar');

    });
});
