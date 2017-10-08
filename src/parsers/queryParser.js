var RegexCollection = require('../parsers/regexCollection.js')
var QueryParser = function (sentence) {
    let regex = new RegexCollection();

    //Remueve de la sentencia los blancos, el punto del final y tabs al inicio si es que los hubiera
    let cleanSentence = (line) => {
        console.log(line)
        return line.replace(regex.regRemoveNoisyCharacters, '')
    }

    let querySentence = cleanSentence(sentence)

    this.hasValidFormat = () => {
        return regex.regValidSentece.test(querySentence)
    }

    this.getName = () => {
        return querySentence.match(regex.regFormatSentenceName)[0];
    }

    this.getParameters = () => {
        let regexResult = querySentence.match(/\([^,:\-\)\(]{1,}(,[^,:\-\)\(]{1,})*\)/) 
        if(regexResult && regexResult.length > 0){
           return regexResult[0].replace(/[\(\)]/g,"").split(",")
        }
        return null
    }

}

module.exports = QueryParser