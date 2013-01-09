/* JSLint */
/*global jelly,Jelly,describe,it, expect, spyOn, dump, use*/
describe('jelly.js', function () {
    'use strict';

    it('should be define modules.', function () {

        jelly.module('A.Foo', function (def) {
            def.hoge = 'hoge';
        });

        jelly.module('A.B.Bar', function (def) {
            def.fuga = 'fuga';
        });

        expect(jelly.module('A.Foo').hoge).toBe('hoge');
        expect(jelly.module('A.B.Bar').fuga).toBe('fuga');
    });

    it('should be initialized when jelly.module called.', function () {
        var initCount = 0;

        jelly.module('B.Foo', function () {
            initCount += 1;
        });

        expect(initCount).toBe(0);

        jelly.module('B.Foo');

        expect(initCount).toBe(1);

        jelly.module('B.Foo');

        expect(initCount).toBe(1);
    });

    it('should throw error if module not found.', function () {
        expect(function () { jelly.module('No.Such.Module'); }).toThrow();
    });

    it('should use dependent module within defining function.', function () {
        jelly.module('C.Foo', function (def) {
            var bar = jelly.module('C.Bar');
            def.bar = bar;
        });

        jelly.module('C.Bar', function (def) {
            def.hoge = 'hoge';
        });

        expect(jelly.module('C.Foo').bar.hoge).toBe('hoge');

    });

    it('should detect cyclic module dependency', function () {
        jelly.module('D.C1', function () {
            jelly.module('D.C2');
        });

        jelly.module('D.C2', function () {
            jelly.module('D.C3');
        });

        jelly.module('D.C3', function () {
            jelly.module('D.C1');
        });

        expect(function () {
            jelly.module('D.C1');
        }).toThrow();
    });

    it('should be clear cache when reset', function () {
        var initCount = 0;

        jelly.module('E.M1', function () {
            initCount += 1;
            return {};
        });

        jelly.module('E.M1');
        jelly.reset();

        jelly.module('E.M1');

        expect(initCount).toBe(2);
    });
    it('can make plugins', function () {
        var m1;
        jelly.reset();

        jelly.plugin('F.M1', function (def) {
            def.pluggedValue = 'abcdef';
        });

        jelly.module('F.M1', function (def) {
            def.foo = 'bar';
        });

        m1 = jelly.module('F.M1');
        expect(m1.foo).toBe('bar');
        expect(m1.pluggedValue).toBe('abcdef');

    });

    it('can mixin modules each other', function () {
        var m2;
        jelly.trait('G.M1', function (def) {
            def.foo = 'FOO';
        });

        jelly.module('G.M2', function (def) {
            jelly.include(def, 'G.M1');
            def.bar = 'BAR';
        });

        m2 = jelly.module('G.M2');

        expect(m2.foo).toBe('FOO');
        expect(m2.bar).toBe('BAR');

    });

    it('should call initialize method if defined', function () {
        var m1,
            t1 = {};

        jelly.module('H.M1', function (def) {
            def.initialize = function () {};
            spyOn(def, 'initialize');
        });

        m1 = jelly.module('H.M1');

        expect(m1.initialize).toHaveBeenCalled();

        jelly.trait('H.T1', function (def) {
            def.initialize = function () {};
            spyOn(def, 'initialize');
        });

        jelly.include(t1, 'H.T1', ['a', 'b', 'c']);

        expect(t1.initialize).toHaveBeenCalledWith('a', 'b', 'c');

    });


    //it('should resolve relative module name , using def.include', function () {
    //    jelly.module('I.M1', function (def) {
    //        var m = def.module('M2');

    //        def.fromM2 = m.foo;
    //    });

    //    jelly.module('I.M2', function (def) {
    //        def.foo = 'FOO';
    //    });

    //    expect(jelly.module('I.M1').fromM2).toBe('FOO');

    //});

});


