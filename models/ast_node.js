class ASTNode {
    constructor(type, value, left = null, right = null) {
        this.type = type;
        this.value = value;
        this.left = left;
        this.right = right;
    }

    toString() {
        return `(type=${this.type}, value=${this.value}, left=${this.left}, right=${this.right})`;
    }
}

module.exports = ASTNode;