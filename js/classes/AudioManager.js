"use strict";

function AudioManager() {
	this.list = {};
}

AudioManager.prototype.add = function (audioList) {
	for (var name in audioList) {
		var audio = audioList[name]; // audio 
		for (var j = 0; j < audio.src.length; j++) {
			var src = audio.src[j];
			var HTMLAudio = new Audio(src);
			HTMLAudio.volume = audio.volume ? audio.volume / 100 : 1;
			
			if(audio.loop && !audio.once) {
				HTMLAudio.onended = function() {
					this.play();
				};
			}
			HTMLAudio.oncanplaythrough = function (HTMLAudio, audio, name) {
				this.list[name] = HTMLAudio;
				if(audio.autoPlay) HTMLAudio.play();
			}.bind(this, HTMLAudio, audio, name);			
			HTMLAudio.onerror = function (audio) {
				console.error('Cannot load this file: ' + audio.url);
			}.bind(this, audio)
		}
	}
};

AudioManager.prototype.muteAll = function() {
	for (var a in this.list) this.list[a].muted = true;
}
AudioManager.prototype.unmuteAll = function() {
	for (var a in this.list) this.list[a].muted = false;
}