const convertToInteger = require('../utils/utils');
const InvalidInputRule = require('../utils/custom_exception');
const OperatorValue = require('../models/operator_value');
const ASTNode = require('../models/ast_node');
const Operator = require('../models/operator');

class ASTBuilder {
    constructor() {
        this.supportedOperators = ["<", "<=", ">", ">=", "=", "!="];
    }

    tokenize(ruleString) {
        ruleString = ruleString.replace(/"/g, "'");
        const pattern = /\s*(=>|AND|OR|\(|\)|>|<|>=|<=|=|!=|'[^']*'|\w+|\d+)\s*/g;
        let tokens = [];
        let match;
        while ((match = pattern.exec(ruleString)) !== null) {
            tokens.push(match[0].trim());
        }
        return tokens;
    }

    getOperandNode(eleList) {
        if (eleList.length < 3) return null;

        const field = eleList.splice(-3, 1)[0];
        const operator = eleList.splice(-2, 1)[0];
        let value = eleList.pop();

        const intValue = convertToInteger(value);
        if (intValue !== null) {
            value = intValue;
        } else if (value[0] === "'" && value[value.length - 1] === "'") {
            value = value.slice(1, -1);
        }

        if (!this.supportedOperators.includes(operator)) {
            throw new Error("Not supported operator");
        }

        const operatorValue = new OperatorValue(field, operator, value);

        return new ASTNode("operand", operatorValue);
    }

    getLeftNode(eleList, nodeList) {
        let node = this.getOperandNode(eleList);

        if (!node) {
            if (nodeList.length === 0) {
                throw new InvalidInputRule("Error occurred in getLeftNode()");
            }

            node = nodeList.pop();
        }

        return node;
    }

    getRightNode(eleList, nodeList) {
        let node = this.getOperandNode(eleList);

        if (!node) {
            if (nodeList.length === 0) {
                throw new InvalidInputRule("Error occurred in getRightNode()");
            }

            node = nodeList.pop();
        }

        return node;
    }

    build(rule) {
        const tokens = this.tokenize(rule);

        const nodeList = [];
        const eleList = [];

        tokens.forEach(ele => {
            if (ele === '(') {
                eleList.push(ele);
            } else if (ele === "AND" || ele === "OR") {
                const leftNode = this.getLeftNode(eleList, nodeList);
                const operatorNode = new ASTNode("operator", Operator.getOperator(ele), leftNode);
                nodeList.push(operatorNode);
            } else if (ele === ')' && nodeList.length === 0) {
                const leftNode = this.getLeftNode(eleList, nodeList);
                nodeList.push(leftNode);
            } else if (ele === ')' && nodeList.length > 0) {
                const rightNode = this.getRightNode(eleList, nodeList);
                nodeList[nodeList.length - 1].right = rightNode;

                if (eleList.length > 0 && eleList[eleList.length - 1] === '(') {
                    eleList.pop();
                } else {
                    throw new InvalidInputRule("Mismatch parentheses");
                }
            } else {
                eleList.push(ele);
            }
        });

        return nodeList[0];
    }

    combineASTNodes(node1, node2) {
        return new ASTNode("operator", Operator.getOperator("AND"), node1, node2);
    }
}

module.exports=ASTBuilder