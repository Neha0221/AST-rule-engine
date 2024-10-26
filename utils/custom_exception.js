class InvalidInputRule extends Error {
    constructor(message) {
        super(message);
        this.name = "InvalidInputRule";
    }
}

module.exports=InvalidInputRule