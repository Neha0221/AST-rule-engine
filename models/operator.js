class Operator {
    static AND = "AND";
    static OR = "OR";

    static getOperator(operatorString) {
        if (operatorString === Operator.AND || operatorString === Operator.OR) {
            return operatorString;
        }
        return null;
    }
}



module.exports = Operator;