class ASTManager {
    constructor(builder, evaluator) {
        this.builder = builder;
        this.evaluator = evaluator;
    }

    createRule(rule) {
        return this.builder.build(rule);
    }

    combineRules(rules) {
        const nodes = rules.map(rule => this.builder.build(rule));
        return nodes.reduce((combinedNode, node) => {
            if (!combinedNode) return node;
            return this.builder.combineASTNodes(combinedNode, node);
        }, null);
    }

    evaluate(rule, jsonData) {
        const astRoot = this.createRule(rule);
        return this.evaluator.evaluate(astRoot, jsonData);
    }
}

module.exports=ASTManager