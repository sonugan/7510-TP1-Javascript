//args: X,Y,Z...
//evalFunc: es una rule o una fact
var TrueFunction = function (args, evalFunc) {
    this.args = args
    this.evalFunc = evalFunc
    this.evaluate = (params) => {
        let paramsToEval = []
        this.args.forEach(a => { paramsToEval.push(params[a]) })
        return this.evalFunc.evaluate(paramsToEval)
    }
}

module.exports = TrueFunction