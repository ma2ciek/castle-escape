function Animation(obj, frames, audio, options) {
	options = options || {};
	this._frames = frames || [];

	if (frames)
		this._size = frames.length;
	else {
		this._size = options.size;
		this._dynamicallyCreateFrames(options);
	}

	this._index = options.startIndex || 0;
	this._frameLooped = options.frameLooped || false;
	this._audioLooped = options.audioLooped || false;
	this._audio = audio.cloneNode();
	this._obj = obj;

	this._audio.addEventListener('ended', this._onAudioEnded);
}

var _p = Animation.prototype;

_p._onAudioEnded = function() {
	if(this._audioLooped)
		this._audio.play();
	this._obj.trigger('audioEnded');
}

_p._dynamicallyCreateFrames = function(options) {

	var offSetLeft = options.offSetLeft || 0;
	var offSetTop = options.offSetTop || 0;

	// row is default
	if (options.frameDirection === 'column') {
		for (var i = 0; i < options.size; i++) {
			this.frames[i] = {
				width: options.frameWidth,
				height: options.frameHeight,
				image: options.image,
				x: offSetLeft,
				y: options.frameHeight * i + offSetTop
			}
		}
	} else {
		for (var i = 0; i < options.size; i++) {
			this.frames[i] = {
				width: options.frameWidth,
				height: options.frameHeight,
				image: options.image,
				x: options.frameWidth * i + offSetLeft,
				y: offSetTop
			}
		}
	}
};



// PUBLIC METHODS

_p.setFrameIndex = function(index) {
	this._index = index;
}

_p.nextFrame = function() {

	if (this._frame < this._size)
		this._frame++;

	else {
		if (this._frameLooped)
			this._frame = 0;
		else {
			this._end = 1;
			this._obj.trigger('animationEnd')
		}
	}

}

_p.getCurrentFrame = function() {
	var frame = this._frames[this._index];
	return {
		image: frame.image,
		x: frame.x,
		y: frame.y,
		width: frame.width,
		height: frame.height
	}
}