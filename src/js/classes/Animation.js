function Animation(options) {
	extend(this, new EventEmitter());
	options = options || {};
	this._size = options.size;
	this._createFrames(options);
	this._timeStamp = 0;
	this._frameIndex = options.startIndex || 0;
	this._frameLooped = options.frameLooped || false;
	this._frameDuration = options.frameDuration || 3;
	this._priorytet = options.priorytet || 0;
	this._audioLooped = options.audioLooped || false;
}

var _p = Animation.prototype;

_p.setAudio = function(audio) {
	this._audio = audio.cloneNode();
	this._audio.addEventListener('ended', this._onAudioEnded);
};

_p._onAudioEnded = function () {
	if (this._audioLooped)
		this._audio.play();
	this._trigger('audioEnded');
};

_p._createFrames = function (options) {

	var offsetLeft = options.offsetLeft || 0;
	var offsetTop = options.offsetTop || 0;
	var i;

	this.frames = [];
	// row direction is default
	if (options.frameDirection === 'column') {
		for (i = 0; i < options.size; i++) {
			this.frames[i] = {
				width: options.frameWidth,
				height: options.frameHeight,
				image: options.image,
				x: offsetLeft,
				y: options.frameHeight * i + offsetTop
			}
		}
	} else {
		for (i = 0; i < options.size; i++) {
			this.frames[i] = {
				width: options.frameWidth,
				height: options.frameHeight,
				image: options.image,
				x: options.frameWidth * i + offsetLeft,
				y: offsetTop
			}
		}
	}
};


_p.setFrameIndex = function (index) {
	this._frameIndex = index;
}

_p.getPrirytet = function() {
	return this._priorytet;
}

_p.nextFrame = function () {
	if (this._timeStamp + this._frameDuration < game.getFrameIndex()) {
		this._timeStamp = game.getFrameIndex();
		
		if (this._frameIndex < this._size - 1)
			this._frameIndex++;

		else {
			if (this._frameLooped)
				this._frameIndex = 0;
			else {
				this._end = 1;
				this._trigger('animationEnd')
			}
		}
	}
}

_p.getCurrentFrame = function () {
	var frame = this.frames[this._frameIndex];
	return {
		image: frame.image,
		x: frame.x,
		y: frame.y,
		width: frame.width,
		height: frame.height
	}
}