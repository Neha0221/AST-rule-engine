class OperatorValue {
    constructor(field, operator, value) {
        this.field = field;
        this.operator = operator;
        this.value = value;
    }

    toString() {
        return `(field=${this.field}, operator='${this.operator}', value=${this.value})`;
    }
}

module.exports = OperatorValue;