var expect = require("chai").expect;
var should = require('should');
var assert = require('assert');

var Interpreter = require('../src/interpreter');


describe("Interpreter", function () {

    var db = [
        "varon(juan).",
        "varon(pepe).",
        "varon(hector).",
        "varon(roberto).",
        "varon(alejandro).",
        "varon(pepe'oscar).",
        "mujer(maria).",
        "mujer(cecilia).",
        "padre(juan, pepe).",
        "padre(juan, pepa).",
        "padre(hector, maria).",
        "padre(roberto, alejandro).",
        "padre(roberto, cecilia).",
        "padre(juan_jose, pepe'oscar).",
        "var_on(juan_jose).",
        "pa-dre(juan_jose, pepe'oscar).",
        "hijo(X, Y) :- varon(X), padre(Y, X).",
        "hija(X, Y) :- mujer(X), padre(Y, X)."
    ];

    var interpreter = null;

    before(function () {
        // runs before all tests in this block
    });

    after(function () {
        // runs after all tests in this block
    });

    beforeEach(function () {
        // runs before each test in this block
        interpreter = new Interpreter();
        interpreter.parseDB(db);
    });

    afterEach(function () {
        // runs after each test in this block
    });


    describe('Interpreter Facts', function () {

        it('varon(juan) should be true', function () {
            assert(interpreter.checkQuery('varon(juan)'));
        });

        it('varon(maria) should be false', function () {
            assert(interpreter.checkQuery('varon(maria)') === false);
        });

        it('mujer(cecilia) should be true', function () {
            assert(interpreter.checkQuery('mujer(cecilia)'));
        });

        it('padre(juan, pepe) should be true', function () {
            assert(interpreter.checkQuery('padre(juan, pepe)') === true);
        });

        it('padre(mario, pepe) should be false', function () {
            assert(interpreter.checkQuery('padre(mario, pepe)') === false);
        });

        it('madre(cecilia, pepe) does not existis, should be null', function () {
            assert(interpreter.checkQuery('madre(cecilia, pepe)') === null);
        });

        it('padre(mario, pepe, pipo) does not existis, should be null', function () {
            assert(interpreter.checkQuery('padre(mario, pepe, pipo)') === null);
        });

        it('padre() does not existis, should be null', function () {
            assert(interpreter.checkQuery('padre()') === null);
        });

        it('Varon(juan) does not existis, should be null', function () {
            assert(interpreter.checkQuery('Varon(juan)') === null);
        });

        it('    varon   (   juan    ) should be true', function () {
            assert(interpreter.checkQuery('    varon   (   juan    )'));
        });
    });

    describe('Interpreter Rules', function () {

        it('hijo(pepe, juan) should be true', function () {
            assert(interpreter.checkQuery('hijo(pepe, juan)') === true);
        });
        it('hija(maria, roberto) should be false', function () {
            assert(interpreter.checkQuery('hija(maria, roberto)') === false);
        });
        it('hijo(pepe, juan) should be true', function () {
            assert(interpreter.checkQuery('hijo(pepe, juan)'));
        });
        it('hijastro(pepe, juan) does not exists, should be null', function () {
            assert(interpreter.checkQuery('hijastro(pepe, juan)') === null);
        });
        it('hijo(pepe, juan,pedro) should be true', function () {
            assert(interpreter.checkQuery('hijo(pepe, juan,pedro)') === null);
        });
        it('hijo() does not exists, should be null', function () {
            assert(interpreter.checkQuery('hijo()') === null);
        });
        it('hijo    (    pepe  , juan  ) should be true', function () {
            assert(interpreter.checkQuery('hijo    (    pepe  , juan  )'));
        });
        it('Hija(maria, roberto), should be null', function () {
            assert(interpreter.checkQuery('Hija(maria, roberto)') === null);
        });
    });

    describe('Invalid format', function(){
        it('padre(cecilia, pepe has an invalid format, should be null', function () {
            assert(interpreter.checkQuery('padre(cecilia, pepe') === null);
        });

        it('mujer[cecilia] has an invalid format, should be null', function () {
            assert(interpreter.checkQuery('mujer[cecilia]') === null);
        });

        it('padre(pepe, ,cecilia) has an invalid format, should be null', function () {
            assert(interpreter.checkQuery('padre(pepe, ,cecilia)') === null);
        });

        it('hijo(pe:-pe, juan) has an invalid format, should be null', function () {
            assert(interpreter.checkQuery('hijo(pe:-pe, juan)') === null);
        });
    })

    describe('Nonalfabetical characters', function(){
        it('var_on(juan_jose) should be true', function () {
            assert(interpreter.checkQuery('var_on(juan_jose)'));
        });

        it('var_on(juana_jose) should be false', function () {
            assert(interpreter.checkQuery('var_on(juana_jose)') === false);
        });

        it('muj_er(juana) should be null', function () {
            assert(interpreter.checkQuery('muj_er(juana)') == null);
        });

        it('pa-dre(juan_jose, pepe\'oscar). should be true', function () {
            assert(interpreter.checkQuery('pa-dre(juan_jose, pepe\'oscar).'));
        });

        it('hijo(pepe\'oscar,juan_jose) should be true', function () {
            assert(interpreter.checkQuery('hijo(pepe\'oscar,juan_jose)'));
        });
    })


});


