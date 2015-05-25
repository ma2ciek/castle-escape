function GameObject(_world, properties) {
	if (!_world) return;

	if (properties.name && properties.name in _world._objectTypes) {
		extend(this, _world._objectTypes[properties.name]);
	}

	extend(this, properties);
	extend(this, new EventEmitter);

	this.sprite = _world._sprites[this.name];

	if (this.sprite) {
		this.height = this.sprite.frameHeight;
		this.width = this.sprite.frameWidth;
		this._frameDuration = this._frameDuration || this.sprite.frameDuration || Infinity;
		extend(this, new Animator);
	} else extend(this, new StaticImage(this));

	
}

GameObject.prototype.draw = function() {
	var translatedPos = relativate(this.x, this.y);
	if(this._currentAction && this._currentAction.sprite) {
		this._currentAction.sprite.drawFrame(ctx, this._currentAction.getOffsetLeft(), this._currentAction.getOffsetTop(),
			translatedPos.x, translatedPos.y);
	}
	else if (this.sprite) {
		this.sprite.drawFrame(ctx, this.getOffsetLeft(), this.getOffsetTop(),
			translatedPos.x, translatedPos.y);
	}
}

GameObject.prototype.action = function(actions) {

	if (this._end)
		return;

	if (this._currentAction)
		return;

	if (actions.requiredKey && !user.keys[actions.requiredKey])
		return;

	this._currentAction = new Action(actions, this);

	this._addEventListener('animationEnd', function() {
		console.log('animation ended');
		this._currentAction = null;
	})
}

function Action(actions, o) {
	this.parent = o;
	extend(this, new EventEmitter);

	// todo: dodac mozliwosc zmiany
	this.once = o.once || true;

	for (var actionType in actions) {
		var value = actions[actionType];
		this._doAction(actionType, value);
	}
}

Action.prototype._doAction = function(actionType, property) {
	switch (actionType) {
		case 'animation':
			this.audio = property.audio;
			this.sprite = game._world._sprites[property.sprite];
			this._frameDuration = this.sprite.frameDuration;
			extend(this, new Animator);
			this.animate();
			break;
		case 'requiredKey':
			break;
		case 'onAnimationEnd':
			this._addEventListener('animationEnd', function() {
				console.log('animation ended');
			})
			break;
		case 'onAudioEnd':
			break;
		default:
			throw (actionType);
	}
}

function EventEmitter () {

}

EventEmitter.prototype._events = {};

EventEmitter.prototype._addEventListener = function(eventType, eventHandler) {
	if (!this._events[eventType])
		this._events[eventType] = [];
	if (typeof eventHandler !== 'function')
		throw new TypeError('eventHandler must be a function');
	this._events[eventType].push(eventHandler);
}

EventEmitter.prototype._trigger = function(eventType) {
	var events = this._events[eventType]
	if (!events)
		return;
	for (var i = 0; i < events.length; i++) {
		events[i].call(this);
		console.log(0)
	}
	this._events[eventType].length = 0;
}


/**** STATIC IMAGE *************/
function StaticImage(self) {
	this.image = new Image();
	this.image.onload = function() {
		self.width = self.image.width;
		self.height = self.image.height;
	}.bind(this, self);
	this.image.src = self.url;
}

StaticImage.prototype.draw = function() {
	var translatedPos = relativate(this.x, this.y);
	this.image.width > 0 && ctx.drawImage(this.image, translatedPos.x, translatedPos.y);
};