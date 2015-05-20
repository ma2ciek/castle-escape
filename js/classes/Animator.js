
/**
 * Klasa animująca różne elementy za pomocą spritów
 */
function Animator(o) {
	this._sprite = o.sprite;
	this._once = o.once || false;
	this._duration = o.duration;
	this._audio = o.audio;
	this._currentFrame = 0;
	this._currentAnimation = o.view ? this._sprite.frameSets.indexOf(o.view) : 0;
	this._timeStamp = (typeof game === 'object') ? game.frame : 0;
	this._end = false;
}

Animator.prototype.getAudio = function () {
	return this._audio && audioManager.list[this._audio];
}

Animator.prototype.getOffsetLeft = function () {
	return this._currentFrame * this._sprite.frameWidth;
};

Animator.prototype.getOffsetTop = function () {
	if (typeof this._currentAnimation === 'string') debugger;
	return this._currentAnimation * this._sprite.frameHeight;

};

Animator.prototype.animate = function (type) {
	type = type || this._sprite.frameSets[this._currentAnimation];
	if (game.frame - this._timeStamp >= this._duration || this._sprite.frameSets.indexOf(type) !== this._currentAnimation) {
		this._timeStamp = game.frame;
		this.nextFrame(this._sprite.frameSets.indexOf(type));
	}
	var audio = this.getAudio();
	if (audio && audio.paused) {
		audio.currentTime = 0;
		audio.play();
	}
}
Animator.prototype.nextFrame = function (type) {
	if (this.once && !this.end) {
		requestAnimationFrame(this.nextFrame.call(this, type));
	}
	if (type !== this._currentAnimation) {
		this._currentFrame = 0;
		this._currentAnimation = type;
	} else if (this._sprite.loop)
		this._currentFrame = (this._currentFrame + 1) % this._sprite.size;
	else
		this._currentFrame = Math.min(this._currentFrame + 1, this._sprite.size - 1);
	if (this._currentFrame === this._sprite.size - 1) this.end = true;
}

function Sprite(o) {
	extend(this, o);
	this.image = new Image();
	this.loaded = false;
	this.image.onload = function () {
		this.loaded = true;
		this.size = this.frameWidth ? this.image.width / this.frameWidth : 1;
	}.bind(this);
	this.image.onerror = function (err) {
		console.log(err)
	}
	this.image.src = o.url;
}

Sprite.prototype.drawFrame = function (ctx, sx, sy, x, y) {
	ctx.drawImage(this.image, sx, sy, this.frameWidth, this.frameHeight,
		x, y, this.frameWidth, this.frameHeight);
}