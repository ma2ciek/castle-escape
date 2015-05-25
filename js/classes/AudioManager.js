"use strict";

function AudioManager() {
	this.list = {};
	this._globalVolume = settings.get('AUDIO_VOLUME');
	this._muted = settings.get('AUDIO_MUTED')
}

AudioManager.prototype.add = function (audioList) {
	for (var name in audioList) {
		var audio = audioList[name]; // audio 
		for (var j = 0; j < audio.src.length; j++) {
			var src = audio.src[j];
			var HTMLAudio = new Audio();
			
			// TODO: Without changing DOM model
			HTMLAudio.localVolume = audio.volume ? audio.volume / 100 : 1;
			HTMLAudio.volume = this._globalVolume * HTMLAudio.localVolume;
			HTMLAudio.muted = this._muted;

			if (audio.loop && !audio.once) {
				HTMLAudio.addEventListener('ended', function () {
					this.play();
				});
			};

			HTMLAudio.addEventListener('canplaythrough', function (HTMLAudio, audio, name) {
				this.list[name] = HTMLAudio;
				if (audio.autoPlay) 
					HTMLAudio.play();
			}.bind(this, HTMLAudio, audio, name));

			HTMLAudio.onerror = function (audio) {
				console.error('Cannot load this file: ' + audio.url);
			}.bind(this, audio);

			HTMLAudio.src = src;
		}
	}
};

AudioManager.prototype.changeGlobalVolume = function (volume) {
	this._globalVolume = volume;
	settings.set('AUDIO_VOLUME', volume);
	for (var a in this.list) {
		this.list[a].volume = this.list[a].localVolume * volume;
	}
}

AudioManager.prototype.muteAll = function () {
	this._muted = true;
	settings.set('AUDIO_MUTED', true);
	for (var a in this.list) {
		this.list[a].muted = true;
	}
}
AudioManager.prototype.unmuteAll = function () {
	this._muted = false;
	settings.set('AUDIO_MUTED', false);
	for (var a in this.list) {
		this.list[a].muted = false;
	}
}