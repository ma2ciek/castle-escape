/* global board */
var settings = (function (modules) {

	for (var i in modules) {
		if (typeof modules[i] === 'undefined') {
			throw new Error('Settings module requires ' + i + ' module');
		}
	}

	var _ctx = null;
	var areVisible = false;
	var _options = {}
	var _storageOptions = {};

	var _defaultOptions = {
		AUDIO_MUTED: false,
		AUDIO_VOLUME: 1,
		AUTO_SAVE: true,
		SETTINGS_ACTIVATE_KEY: 27
	}

	function _shallowCopyTo(o1, o2) {
		for (var name in o2) {
			if (o2.hasOwnProperty(name)) {
				o1[name] = o2[name];
			}
		}
		return o1;
	}

	function init(ctx, settings) {
		_ctx = ctx;

		_loadSettingsFromStorage();

		settings = settings || {};

		_shallowCopyTo(_options, _defaultOptions);
		_shallowCopyTo(_options, _storageOptions);
		_shallowCopyTo(_options, settings);

		_addEventHandler();
	}
	function _addEventHandler() {
		window.addEventListener('keydown', function (e) {
			if (e.keyCode === _options['SETTINGS_ACTIVATE_KEY'])
				toggleVisible();
		})
	}

	function toggleVisible() {
		areVisible = !areVisible;
	}

	function save() {
		var data = JSON.stringify(_options);
		localStorage.setItem('Warrior-settings', data);
	}
	function _loadSettingsFromStorage() {
		var data = localStorage.getItem('Warrior-settings') || '{}';
		_storageOptions = JSON.parse(data);
	}

	function getProperty(property) {
		if (typeof property === 'undefined')
			return _options;
		if (!_options.hasOwnProperty(property))
			console.error('No such property in settings');
		return _options[property];
	}

	function setProperty(property, value) {
		if (!_options.hasOwnProperty(property))
			console.error('No such property in settings');
		else {
			_options[property] = value;
			if (_options['AUTO_SAVE'])
				save();
		}
	}

	function restoreDefault() {
		_options = _shallowCopyTo({}, _defaultOptions);
		save();
	}

	return {
		init: init,
		save: save,
		get: getProperty,
		set: setProperty,
		restoreDefault: restoreDefault,
		get areVisible() {
			return areVisible;
		},
		toggleVisible: toggleVisible
	};

})({
	loadJSON: loadJSON
});