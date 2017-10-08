var Fact = require('../src/models/fact');
var Rule = require('../src/models/rule');
var TrueFunction = require('../src/models/trueFunction');
var Parser = require('../src/parsers/parser');
var QueryParser = require('../src/parsers/queryParser');

var Interpreter = function () {
    let getByName = (name) => {
        let expressionList = this.db.filter((s) => { return s.name == name})
        if(expressionList.length){
            return expressionList[0]
        }
        return null
    }

    this.db = []

    this.parseDB = function (db) {
        let parser = new Parser(db)
        if(parser.hasInvalidSentences()){
            console.log("Hay sentencias con un formato incorrecto")
            return null
        }
        this.db = parser.parse()
    }

    this.checkQuery = function (query) {
        let queryParser = new QueryParser(query)
        if(!queryParser.hasValidFormat()){
            console.log('formato invalido: ' + query)
            return null
        }
        let name = queryParser.getName()
        let params = queryParser.getParameters()
        let expression = getByName(name)
        if(!expression){
            console.log('no existe la expresion')
            return null
        }
        return expression.evaluate(params)
    }

}

module.exports = Interpreter;
