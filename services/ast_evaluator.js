class ASTEvaluator {
    performOperation(operator, trueValue, inputValue) {
        switch (operator) {
            case "=":
                return trueValue === inputValue;
            case "!=":
                return trueValue !== inputValue;
            case "<":
                return trueValue < inputValue;
            case "<=":
                return trueValue <= inputValue;
            case ">":
                return trueValue > inputValue;
            case ">=":
                return trueValue >= inputValue;
            case "AND":
                return trueValue && inputValue;
            case "OR":
                return trueValue || inputValue;
            default:
                throw new Error("Not supported operator");
        }
    }

    executeCheck(operatorValue, jsonData) {
        if (operatorValue.field in jsonData) {
            const value = jsonData[operatorValue.field];
            return this.performOperation(operatorValue.operator, operatorValue.value, value);
        }
        return null;
    }

    _helper(node, jsonData) {
        if (node.type === "operand") {
            return this.executeCheck(node.value, jsonData);
        } else {
            const leftCheck = this._helper(node.left, jsonData);
            const rightCheck = this._helper(node.right, jsonData);

            if (leftCheck === null && rightCheck === null) {
                return null;
            } else if (leftCheck === null) {
                return rightCheck;
            } else if (rightCheck === null) {
                return leftCheck;
            } else {
                return this.performOperation(node.value, leftCheck, rightCheck);
            }
        }
    }

    evaluate(root, jsonData) {
        const verdict = this._helper(root, jsonData);
        return verdict !== false;
    }
}

module.exports=ASTEvaluator