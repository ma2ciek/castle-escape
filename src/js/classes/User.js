function User() {
	this.lang = navigator.language || navigator.userLanguage || 'pl';
	this.cores = navigator.hardwareConcurrency || 4;
	this.touchPoints = navigator.maxTouchPoints;
	this.canVibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
	this.keys = {};
	this._setEventListeners();
	this.actions = {};
}

User.prototype._setEventListeners = function() {
	var self = this;
	window.addEventListener('keydown', function(e) {
		var assignments = settings.getAssignments();
		var action = assignments.getActionFromCode(e.keyCode);
		if (action)
			self.actions[action] = true;
		self.keys[e.keyCode] = true;

	});
	window.addEventListener('keyup', function(e) {
		var assignments = settings.getAssignments();
		var action = assignments.getActionFromCode(e.keyCode);
		if (action)
			self.actions[action] = false;
		self.keys[e.keyCode] = false;
	});
	window.addEventListener('blur', function() {
		self.keys = {};
	});
}