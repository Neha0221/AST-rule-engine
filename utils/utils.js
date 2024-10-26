function convertToInteger(s) {
    const num = parseInt(s, 10);
    return isNaN(num) ? null : num;
}

module.exports=convertToInteger