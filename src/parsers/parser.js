var Fact = require('../../src/models/fact');
var Rule = require('../../src/models/rule');
var TrueFunction = require('../../src/models/trueFunction');
var RegexCollection = require('../parsers/regexCollection.js')

var Parser = function (dbSentences) {
    let regex = new RegexCollection();

    //Retorna todas las sentencias vacías
    let removeEmptySentences = (db) => {
        return db.filter(line => {return line})
    }

    //Remueve de la sentencia los blancos, el punto del final y tabs al inicio si es que los hubiera
    let cleanSentence = (line) => {
        return line.replace(regex.regRemoveNoisyCharacters, '')
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
                let fact = parsedDb.filter(f => { return f.name == name })
                if(!fact || !fact.length){
                    throw new Error("No se encuentra definido: " + name)
                }
                trueFuncs.push(new TrueFunction(params, fact[0]))
            })
        return trueFuncs
    }

    let db = dbSentences
    let parsedDb = []
    //Indica si la base de datos tiene sentencias que no cumplen con el formato correcto
    this.hasInvalidSentences = () => {
        let cleanDb =  removeEmptySentences(db).map(line => { return cleanSentence(line) })
        return cleanDb.map(sentence => { return !hasValidFormat(sentence)}).reduce((a,b) => { return a && b });       
    }

    this.parse = () => {
        let cleanDb =  removeEmptySentences(db).map(line => { return cleanSentence(line) })
        cleanDb.forEach(sentence => {
            let name = getSentenceName(sentence)
            let params = getParameters(sentence)
            if(isRule(sentence)){
                parsedDb.push(new Rule(name, params, getRuleComponents(sentence)))
            }else{
                let factList = parsedDb.filter((trueSentence) => { return trueSentence.name == name })
                if(factList.length > 0){
                    let fact = factList[0];
                    fact.addArguments(params)
                }else{
                    let fact = new Fact(name, params.length)
                    fact.addArguments(params)
                    parsedDb.push(fact);
                }                
            }
        })
        return parsedDb;
    }
}

module.exports = Parser