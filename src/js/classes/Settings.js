function Settings() {
	extend(this, new EventEmitter());
	this._options = {};
	this._storageOptions = {};
	this.setDefaultOptions();
	this._assignments = new Assignments();
	this._loadSettingsFromStorage();
}

var _p = Settings.prototype;

_p.setDefaultOptions = function () {
	// Can be stored in external JSON file
	var options = this._options = {
		AUDIO_VOLUME: {
			value: 1,	
			valueType: 'number',
			settingsType: 'audio',
			inputType: 'range',
			minValue: 0,
			maxValue: 1,
			step: 0.1
		}
	};

	(function createNiceNames() {
		for (var propName in options) {
			var o = options[propName];
			o.niceName = propName.replace('_', ' ').toLowerCase();
			o.niceName = propName[0] + o.niceName.substr(1);
		}
	})();
};

_p.getAssignments = function () {
	return this._assignments;
};

_p.save = function () {
	var values = {};
	for (var propName in this._options) {
		values[propName] = this._options[propName].value;
	};

	var data = JSON.stringify(values);
	localStorage.setItem('Warrior-settings', data);
};

_p._loadSettingsFromStorage = function () {
	var data = localStorage.getItem('Warrior-settings') || '{}';
	var storageOptions = JSON.parse(data);

	for (var propName in storageOptions) {
		this._options[propName].value = storageOptions[propName];
	}
};

_p.getPropValue = function (property) {
	console.log(property);
	return this._options[property].value;
};

_p.getAll = function () {
	return this._options;
};

_p.setPropValue = function (property, value) {
	console.log(property, value)
	var op = this._options[property];
	console.log(op);
	if (op.valueType === 'number')
		value = Number(value);

	if (op.valueType === 'boolean') {
	console.log(value);
		
		value = (value === 'true' || value === true || value === 1 || value === '1');
	console.log(value);
	
	}

	this._options[property].value = value;
	this.save();
	this._trigger('change', property, value);
};