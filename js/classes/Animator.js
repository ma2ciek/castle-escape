/**
 * Klasa animująca różne elementy za pomocą spritów i dźwięku
 * Służy do rozszerzania obiektu
 */
function Animator() {
	this._currentFrame = 0;
	this._currentAnimation = this.view ? this.sprite.frameSets.indexOf(this.view) : 0;
	this._timeStamp = 0;
	this._end = false;
}

Animator.prototype.getOffsetLeft = function() {
	return this._currentFrame * this.sprite.frameWidth;
};

Animator.prototype.getOffsetTop = function() {
	return this._currentAnimation * this.sprite.frameHeight;
};

Animator.prototype.getCurrentAnimationName = function(type) {
	if (!type || type === 'default')
		return this.sprite.frameSets[this._currentAnimation];
	else
		return type;
};

Animator.prototype.canAnimate = function() {
	return game.getCurrentFrameIndex() - this._timeStamp >= this._frameDuration;
};

Animator.prototype.animate = function(type) {
	type = this.getCurrentAnimationName(type);
	if (this.canAnimate()) {
		this._timeStamp = game.getCurrentFrameIndex();
		this.nextFrame(this.sprite.frameSets.indexOf(type));
	}

	var audio = this.getAudio();
	if(audio) {
		this.playAudio();
	} 
}

Animator.prototype.getAudio = function() {
	return this.audio && audioManager.list[this.audio];
}

Animator.prototype.playAudio = function() {
	audio = this.getAudio();
	audio.play();
}

Animator.prototype.nextFrame = function(type) {
	console.log(this);
	if (this.once && !this._end) {
		game.addEvent(this._frameDuration, this.nextFrame.bind(this, type));
	}

	if (type !== this._currentAnimation) {
		this._currentFrame = 0;
		this._currentAnimation = type;

	} else if (this.sprite.loop) {
		this._currentFrame = (this._currentFrame + 1) % this.sprite.size;
	}

	else if (!this._end) {
		this._currentFrame = Math.min(this._currentFrame + 1, this.sprite.size - 1);
		if (this._currentFrame === this.sprite.size - 1) {
			this._end = true;
			this._trigger('animationEnd');
		}
	}
}

function Sprite(o) {
	extend(this, o);
	this.image = new Image();
	this.loaded = false;
	this.image.onload = function() {
		this.loaded = true;
		this.size = this.frameWidth ? this.image.width / this.frameWidth : 1;
	}.bind(this);
	this.image.onerror = function(err) {
		console.log(err)
	}
	this.image.src = o.url;
}

Sprite.prototype.drawFrame = function(ctx, sx, sy, x, y) {
	ctx.drawImage(this.image, sx, sy, this.frameWidth, this.frameHeight,
		x, y, this.frameWidth, this.frameHeight);
}