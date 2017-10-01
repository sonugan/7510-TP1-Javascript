var Parser = require('../src/parser');

var Interpreter = function () {
    var RegexCollection = function () {
        let strNoisyCharacters = "[ \. \t]"
        let strregFormatSentenceName = "[^(]{1,}" 
        let strFormatRuleParamsName = "[A-Z]{1,}[_\\0-9A-Z]*"
        let strFormatRuleParams = "\\(" + strFormatRuleParamsName + "(," + strFormatRuleParamsName + "){0,}\\)"
        let strFormatFactQueryParams = "\\([^\\( :-]{1,}(,[^\\( :-]{1,}){0,}\\)"
        //let strRule = "^[^\\(]{1,}\\([A-Z0-9]{1,}(,[A-Z0-9]{1,})*\\):-[^\\(]{1,}\\([A-Z0-9]{1,}(,[A-Z0-9]{1,})*\\)([^\\(]{1,}\\([A-Z0-9]{1,}(,[A-Z0-9]{1,})*\\))*$"
        let strRule = "^[^\(]{1,}\([A-Z0-9]{1,}(,[A-Z0-9]{1,})*\):-[^\(]{1,}\([A-Z0-9]{1,}(,[A-Z0-9]{1,})*\)([^\(]{1,}\([A-Z0-9]{1,}(,[A-Z0-9]{1,})*\))*$"
        let strFact = "^" + strregFormatSentenceName + strFormatFactQueryParams + "$"

        //Caracteres a remover de todas las sentencias
        this.regRemoveNoisyCharacters = new RegExp(strNoisyCharacters, "g")
        //Se declaran regular expressions con los formatos que deben cumplir las sentencias y consultas
        //Nombre de las sentencias: facts, rules y queries
        this.regFormatSentenceName = new RegExp(strregFormatSentenceName)
        this.formatRuleParamsName = new RegExp(strFormatRuleParamsName)
        //Parametros de las rules
        this.formatRuleParams = new RegExp(strFormatRuleParams)
        this.formatFactQueryParams = new RegExp(strFormatFactQueryParams)
        //Componentes de las rules
        this.formatComponents = new RegExp(strregFormatSentenceName + strFormatRuleParams + "(," + strregFormatSentenceName + strFormatRuleParams + "){0,}")
        //Regular expression que define el formato válido de una Rule
        this.regRule = new RegExp(strRule)
        this.regFact = new RegExp(strFact)
        //this.regValidSentece = new RegExp("(" + strRule + ")|(" + strFact + ")")
        this.regValidSentece = new RegExp("[a-zA-Z]*")
    }
    let regex = new RegexCollection();
    
    //Retorna todas las sentencias vacías
    let removeEmptySentences = (db) => {
        return db.filter(line => {return line})
    }

    //Remueve de la sentencia los blancos, el punto del final y tabs al inicio si es que los hubiera
    let cleanSentence = (line) => {
        return line.replace(regex.regRemoveNoisyCharacters, '')
    }

    //Indica si la base de datos tiene sentencias que no cumplen con el formato correcto
    let hasInvalidSentences = (cleanDb) => {
        return cleanDb.map(sentence => { return !hasValidFormat(sentence)}).reduce((a,b) => { return a && b });       
    }

    let hasValidFormat = (sentence) => {
        return regex.regValidSentece.test(sentence)
    }

    //Retorna el nombre de la sentencia
    //nombre(param1,param2)
    let getSentenceName = (sentence) => {
        return sentence.match(regex.regFormatSentenceName)[0];
    }    

    //Retorna los parametros de la sentencia
    let getParameters = (sentence) => {
        let regexResult = sentence.match(/\([^,:\-\)\(]{1,}(,[^,:\-\)\(]{1,})*\)/) 
        if(regexResult && regexResult.length > 0){
           return regexResult[0].replace(/[\(\)]/g,"").split(",")
        }
        return null
    }

    let isRule = (sentence) => {
        //return regex.regRule.test(sentence)
        return /:\-/.test(sentence)
    }

    //Retorna los componentes de una rule. Dada r(X):-a(X),b(X) retorna [a(X) b(X)]
    let getRuleComponents = (sentence) => {
        let trueFuncs = []
        sentence.replace(/^([^:]*:\-)/, "")
            .replace(/\),/g, ")|")//reemplazo las comas separadoras de facts por pipes para poder hacer el split sin que separe los parametros de los facts
            .split("|")
            .forEach(component => {
                let name = getSentenceName(component)
                let params = getParameters(component)
                let fact = this.db.filter(f => { return f.name == name })
                if(!fact || !fact.length){
                    throw new Error("No se encuentra definido: " + name)
                }
                trueFuncs.push(new TrueFunction(params, fact[0]))
            })
        return trueFuncs
    }

    let getByName = (name) => {
        let expressionList = this.db.filter((s) => { return s.name == name})
        if(expressionList.length){
            return expressionList[0]
        }
        return null
    }

    var Sentence = function () {
        
    }
    //varon(juan) <-> varon(X):-X==juan
    var Fact = function (name, argsCount) {
        this.name = name
        this.argsCount = argsCount
        this.args = []
        this.addArguments = (args) => {
            if(argsCount != args.length){
                throw new Error("La cantidad de argumentos no concuerda con la definicion");
            }
            this.args.push(args)
        }
        this.evaluate = (params) => {
            return this.args.map(arg => { 
                if(!params || arg.length != params.length){
                    return false
                }
                return arg.map((a,i) => { 
                    return a == params[i]
                }).reduce(and)
            }).reduce(or)
        }
    }

    let and = (a, b) => { return a && b }
    let or = (a, b) => { return a || b }

    var Rule = function (name, args, trueFuncs) {
        this.name = name
        this.args = args
        this.trueFuncs = trueFuncs
        this.evaluate = (params) => {
            let paramsToEval = {}
            this.args.forEach((a,i) => { paramsToEval[a] = params[i] })
            return this.trueFuncs.map(f => { return f.evaluate(paramsToEval)}).reduce((r1,r2) => { return r1 && r2 })
        }
    }

    //args: X,Y,Z...
    //evalFunc: es una rule o una fact
    var TrueFunction = function(args, evalFunc){
        this.args = args
        this.evalFunc = evalFunc
        this.evaluate = (params) => {
            let paramsToEval= []
            this.args.forEach(a=> { paramsToEval.push(params[a]) })
            return this.evalFunc.evaluate(paramsToEval)
        }
    }

    this.db = []

    this.parseDB = function (db) {
        let cleanDb =  removeEmptySentences(db).map(line => { return cleanSentence(line) })
        if(hasInvalidSentences(cleanDb)){
            console.log("Hay sentencias con un formato incorrecto")
            return null
        }
        cleanDb.forEach(sentence => {
            let name = getSentenceName(sentence)
            let params = getParameters(sentence)
            if(isRule(sentence)){
                this.db.push(new Rule(name, params, getRuleComponents(sentence)))
            }else{
                let factList = this.db.filter((trueSentence) => { return trueSentence.name == name })
                if(factList.length > 0){
                    let fact = factList[0];
                    fact.addArguments(params)
                }else{
                    let fact = new Fact(name, params.length)
                    fact.addArguments(params)
                    this.db.push(fact);
                }                
            }
        })
    }

    this.checkQuery = function (query) {
        let cleanedQuery = cleanSentence(query)
        if(!hasValidFormat(cleanedQuery)){
            console.log('formato invalido: ' + cleanedQuery)
            return null
        }
        let name = getSentenceName(cleanedQuery)
        let params = getParameters(cleanedQuery)
        let expression = getByName(name)
        if(!expression){
            console.log('no existe la expresion')
            return null
        }
        return expression.evaluate(params)
    }

}

module.exports = Interpreter;

var db = [
    "varon(juan).",
    "varon(pepe).",
    "varon(hector).",
    "varon(roberto).",
    "varon(alejandro).",
    "mujer(maria).",
    "mujer(cecilia).",
    "padre(juan, pepe).",
    "padre(juan, pepa).",
    "padre(hector, maria).",
    "padre(roberto, alejandro).",
    "padre(roberto, cecilia).",
    "hijo(X, Y) :- varon(X), padre(Y, X).",
    "hija(X, Y) :- mujer(X), padre(Y, X)."
];

// let interpreter = new Interpreter();
// interpreter.parseDB(db);
// console.log(interpreter.checkQuery("varon(juan)"))
// console.log(interpreter.checkQuery("mujer(cecilia)"))
// console.log(interpreter.checkQuery("padre(roberto, cecilia)"))
// console.log(interpreter.checkQuery("hija(cecilia,roberto)"))
// console.log(interpreter.checkQuery("varon(carolina)"))
// console.log(interpreter.checkQuery("hija(cecilia,robert)"))
// let getParameters = (sentence) => {
//     let strFormatFactQueryParams = "\\([^\\( :-]{1,}(,[^\\( :-]{1,}){0,}\\)"
//     let formatFactQueryParams = /\([^,:\-\)\(]{1,}(,[^,:\-\)\(]{1,})*\)/
//     let regexResult = sentence.match(formatFactQueryParams) 
//     console.log(regexResult)
//     if(regexResult.length > 0){
//        return regexResult[0].replace(/[\(\)]/g,"").split(",")
//     }
//     return null
// }
// console.log(getParameters("padre(roberto, cecilia)"))
