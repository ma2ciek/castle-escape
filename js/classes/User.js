function User() {
	this.lang = navigator.language || navigator.userLanguage || 'pl';
	this.cores = navigator.hardwareConcurrency || 4;
	this.touchPoints = navigator.maxTouchPoints;
	this.keys = {};
	this._setEventListeners();
}

User.prototype._setEventListeners = function () {
	var self = this;
	window.addEventListener('keydown', function(e) {
		self.keys[e.keyCode] = true;
	});
	window.addEventListener('keyup', function(e) {
		self.keys[e.keyCode] = false;
	});
	window.addEventListener('blur', function() {
		self.keys = {};
	});
}