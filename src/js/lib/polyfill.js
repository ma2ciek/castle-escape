// JS Objects change

Date.now = Date.now || function () {
    return +new Date();
};
Math.sign = Math.sign || function(x) {
    return x === 0 ? 0 : x / Math.abs(x);
};
Array.prototype.includes = Array.prototype.includes || function(x) {
    return this.indexOf(x) !== -1;
};
