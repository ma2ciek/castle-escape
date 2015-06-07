"use strict";

function Assignments() {
	extend(this, new EventEmitter());
	this._list = {};
	this._keys = {};
	this._activeBinding = null;
	this._setKeyNames();
	this._setDefaultAssignments();
	this._loadAssignmentsFromStorage();
}

Assignments.prototype.getList = function() {
	return this._list;
};

Assignments.prototype.getCodeFromAction = function(action) {
	var keyName = this._list[action];
	for (var keyCode in this._keys) {
		if (this._keys[keyCode] === keyName)
			return keyCode;
	}
}

Assignments.prototype.getActionFromCode = function(code) {
	var keyName = this._keys[code];
	for(var action in this._list) {
		if(this._list[action] == keyName) {
			return action;
		}
	}
}

Assignments.prototype.getKeyName = function(action) {
	return this._list[action];
};

Assignments.prototype.setActiveBinding = function(action) {
	this._activeBinding = action;
};

Assignments.prototype._setKeyNames = function() {
	var keys = {
		8: 'Backspace',
		9: 'Tab',
		13: 'Enter',
		16: 'Shift',
		17: 'Ctrl',
		18: 'Alt',
		19: 'Pause/Break',
		20: 'Caps lock',
		27: 'Escape',
		32: 'Space',
		33: 'Page up',
		34: 'Page down',
		35: 'End',
		36: 'Home',
		37: 'Left arrow',
		38: 'Up arrow',
		39: 'Right arrow',
		40: 'Down arrow',
		45: 'Insert',
		46: 'Delete',
		91: 'Left window key',
		92: 'Right window key',
		93: 'Select key',
		144: 'Num lock',
		145: 'Scroll lock',
		186: 'Semicolon',
		187: 'Equal sign',
		188: 'Comma',
		189: 'Dash',
		190: 'Period',
		191: 'Forward slash',
		192: 'Grave accent',
		219: 'Open bracket',
		220: 'Back slash',
		221: 'Close bracket',
		222: "Quote",
		255: 'Fn'
	};
	var i;

	for (i = 48; i <= 57; i++) { // Numbers
		keys[i] = String.fromCharCode(i);
	}

	for (i = 65; i <= 90; i++) { // Characters
		keys[i] = String.fromCharCode(i);
	}

	for (i = 96; i <= 105; i++) { // Numbers on numpad
		keys[i] = 'Numpad ' + (i - 96);
	}

	for (i = 112; i <= 123; i++) { // Special functions
		keys[i] = 'F' + (i - 111);
	}

	this._keys = keys;
};

Assignments.prototype._loadAssignmentsFromStorage = function() {
	var data = window.localStorage.getItem('Castle_Ecape_Bindings') || '{}';
	var bindings = JSON.parse(data);
	for (var action in bindings) {
		this._list[action] = bindings[action];
	}
};

Assignments.prototype.tryBind = function(keyCode) {
	var key = this._keys[keyCode];
	for (var action in this._list) {
		if (action === this._activeBinding) {
			this._list[action] = key || '';
			this._removeAssignmentNotFrom(key, action);
			this._saveAssignmentToStorage();
			this._trigger('changeAssignnment', action)
			return true;
		}
	}
};

Assignments.prototype._removeAssignmentNotFrom = function(key, currentCheckingAction) {
	for (var action in this._list) {
		if (this._list[action] === key && currentCheckingAction != action) {
			this._list[action] = '';
			this._trigger('changeAssignnment', action)
			break;
		}
	}
};

Assignments.prototype._saveAssignmentToStorage = function() {
	var data = JSON.stringify(this._list);
	window.localStorage.setItem('Castle_Ecape_Bindings', data);
};

Assignments.prototype._setDefaultAssignments = function() {
	var defaultAssignments = {
		'Move Left': 'Left arrow',
		'Move Right': 'Right arrow',
		'Climb Up': 'Up arrow',
		'Climb Down': 'Down arrow',
		'Jump': 'Space',
		'Attack': 'Alt',
		'Inventory': 'I'
	};

	for (var action in defaultAssignments) {
		this._list[action] = defaultAssignments[action];
		this._trigger('changeAssignnment', action);
	}
};