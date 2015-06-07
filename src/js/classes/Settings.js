"use strict";

function Settings() {
	this._options = {};
	this._storageOptions = {};
	this._defaultOptions = {
		AUDIO_MUTED: false,
		AUDIO_VOLUME: 1,
		AUTO_SAVE: true
	}
	this._assignments = new Assignments();
	this._loadSettingsFromStorage();

	shallowCopyTo(this._options, this._defaultOptions);
	shallowCopyTo(this._options, this._storageOptions);
}

var _p = Settings.prototype;

_p.getAssignments = function() {
	return this._assignments;
}

_p.save = function() {
	var data = JSON.stringify(this._options);
	localStorage.setItem('Warrior-settings', data);
};

_p._loadSettingsFromStorage = function() {
	var data = localStorage.getItem('Warrior-settings') || '{}';
	this._storageOptions = JSON.parse(data);
};

_p.get = function(property) {
	if (typeof property === 'undefined')
		return this._options;
	if (!this._options.hasOwnProperty(property))
		console.error('No such property in settings');
	return this._options[property];
};

_p.set = function(property, value) {
	if (!this._options.hasOwnProperty(property))
		console.error('No such property in settings');
	else {
		this._options[property] = value;
		if (this._options['AUTO_SAVE'])
			this.save();
	}
};

_p.restoreDefault = function() {
	this._options = shallowCopyTo({}, this._defaultOptions);
	this.save();
};
