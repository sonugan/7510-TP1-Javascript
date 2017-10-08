var LogicalOperations = require("../../src/LogicalOperations")

//varon(juan) <-> varon(X):-X==juan
var Fact = function (name, argsCount) {
    let logicalOperations = new LogicalOperations()
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
        if(!params || this.argsCount != params.length){
            return null
        }
        return this.args.map(arg => { 
            return arg.map((a,i) => { 
                return a == params[i]
            }).reduce(logicalOperations.and)
        }).reduce(logicalOperations.or)
    }
}

module.exports = Fact