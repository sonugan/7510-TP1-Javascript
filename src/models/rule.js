var Rule = function (name, args, trueFuncs) {
    this.name = name
    this.args = args
    this.trueFuncs = trueFuncs
    this.evaluate = (params) => {
        if(!params || params.length != this.args.length){
            return null
        }
        let paramsToEval = {}
        this.args.forEach((a,i) => { paramsToEval[a] = params[i] })
        return this.trueFuncs.map(f => { return f.evaluate(paramsToEval)}).reduce((r1,r2) => { return r1 && r2 })
    }
}

module.exports = Rule