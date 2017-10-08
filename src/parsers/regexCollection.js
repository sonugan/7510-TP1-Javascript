var RegexCollection = function () {
    let strNoisyCharacters = "[ \. \t]"
    let strregFormatSentenceName = "[^(]{1,}" 
    let strFormatRuleParamsName = "[A-Z]{1,}[_\\0-9A-Z]*"
    let strFormatRuleParams = "\\(" + strFormatRuleParamsName + "(," + strFormatRuleParamsName + "){0,}\\)"
    let strFormatFactQueryParams = "\\([^\\( :-]{1,}(,[^\\( :-]{1,}){0,}\\)"
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
    this.regValidSentece = new RegExp("[a-zA-Z]*")
}

module.exports = RegexCollection