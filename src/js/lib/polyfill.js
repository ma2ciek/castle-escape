// JS Objects change

Date.now = Date.now || function () {
    return +new Date();
};

Math.sign = Math.sign || function (x) {
    return x === 0 ? 0 : x / Math.abs(x);
};

Array.prototype.indexOf = Array.prototype.indexOf || function (x) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === x)
            return i;
    }
    return -1;
};

Array.prototype.includes = Array.prototype.includes || function (x) {
    return this.indexOf(x) !== -1;
};
