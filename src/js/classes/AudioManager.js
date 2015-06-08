function AudioManager() {
	extend(this, new EventEmitter());
	this._list = {};
	this._waiting = 0;
	this._loadSettings();
	this._setSettingsChangeListener();
}
var _p = AudioManager.prototype;

_p.add = function (audioList) {
	var length  = Object.keys(audioList).length;
	this._waiting += length;

	for (var name in audioList) {
		var audio = audioList[name];
		var HTMLAudio = new Audio();
		
		// TODO: Without changing DOM model
		HTMLAudio.name = name;
		HTMLAudio.src = audio.src;
		HTMLAudio.localVolume = audio.volume ? audio.volume / 100 : 1;
		HTMLAudio.volume = this._globalVolume * HTMLAudio.localVolume;

		if (audio.loop && !audio.once) {
			HTMLAudio.addEventListener('ended', this.play);
		}
		
		var cpt = this._canplaythrough.bind(this, HTMLAudio, audio, name);
		HTMLAudio.addEventListener('canplaythrough', cpt);
		HTMLAudio.onerror = this._onerror;

	}
	return this;
};

_p._loadSettings = function() {
	var settingsAssignments = {
		'AUDIO_VOLUME': '_globalVolume',
	}
	for(var optionName in settingsAssignments) {
		var prop = settingsAssignments[optionName];
		var value =  settings.getPropValue(optionName);
		this[prop] = value;
	}
}

_p._setSettingsChangeListener = function() {
	
	var actionAssignments = {
		'AUDIO_VOLUME': '_changeGlobalVolume',
	};
	
	settings._addEventListener('change', function(optionName, value) {
		var method = actionAssignments[optionName];
		
		this[method].call(this, value);
	}.bind(this));
}

_p._canplaythrough = function (HTMLAudio, audio, name) {
	this._list[name] = HTMLAudio;
	this._loaded();
};

_p._onerror = function(audio) {
	console.error('Cannot load this file: ' + audio.src);
	this._loaded();
}

_p.get = function(audioName) {
	if(audioName in this._list)
		return this._list[audioName];
	else
		console.error('Missing audio file: ' + audioName);
};

_p._loaded = function() {
	console.log(this._waiting);
	this._waiting--;
	if(this._waiting === 0)
		this._trigger('audioLoaded');
};

_p._changeGlobalVolume = function (volume) {
	this._globalVolume = volume;
	for (var a in this._list) {
		this._list[a].volume = this._list[a].localVolume * volume;
	}
};

function BgAudio() {
	this._bgAudio = null;
}

BgAudio.prototype._setBgAudio = function(audioName) {

	if(this._bgAudio) {
		if(this._bgAudio.name === audioName)
			return;
		this._bgAudio.pause();
	} 
	try {
		this._bgAudio = audioManager.get(audioName);
		this._bgAudio.currentTime = 0;
		this._bgAudio.play();
	} catch(err) {
		console.error(err);
	}
}