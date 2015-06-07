function Player(world) {
	var self = this;
	this._world = world;
	this.x = 1265;
	this.y = 2140;
	this.Vy = 0;
	this.width = 48;
	this.height = 92;
	this.speed = 7;
	this.shadowRelativePosition = {
		get x() { return self.x + 23 },
		get y() { return self.y + 15 },
		get width() { return 20 },
		get height() { return 67 },
	};
	this.jumpHeight = 20;
	this.isOnLadder = false;

	// this.audio = audioManager['road'];
	extend(this, new EventEmitter());
	
	// Get prototype functions of GameObject
	extend(this, GameObject.prototype);

	this._setAnimation();
}
var _p = Player.prototype;

_p._setAnimation = function() {

	this.frameSets = [
		"moveDown",
		"moveDownLeft",
		"moveLeft",
		"moveUpLeft",
		"moveUp",
		"moveUpRight",
		"moveRight",
		"moveDownRight"
	];

	var self = this;
	var frameDuration = 3;
	var frameWidth = 48;
	var frameHeight = 92;
	var size = 9;

	this.animations = {};
	this.currentAnimationName = this.frameSets[0];
	this.ready = false;
	this.image = new Image();
	this.image.src = "img/walk-cycle.png";

	this.image.addEventListener('load', function () {
		self.frameSets.forEach(function (animationName, index) {
			self.animations[animationName] = new Animation(self, false, {
				image: self.image,
				frameWidth: frameWidth,
				frameHeight: frameHeight,
				size: size,
				frameLooped: true,
				offsetTop: frameHeight * index,
				frameDuration: frameDuration
			})
		});
		self.ready = true;
		world.addObject(self);
	});
}

_p.animate = function (animationName) {
	if (this.ready) {
		if (this.currentAnimationName === animationName)
			this.animations[animationName].nextFrame();
		else {
			this.currentAnimationName = animationName;
			this.animations[animationName].nextFrame();
		}
	}
}

_p.move = function () {
	var dirX = 0;
	var dirY = 0;

	var oldX = this.x;
	var oldY = this.y;

	if (user.actions['Climb Up']) dirY--;
	if (user.actions['Climb Down']) dirY++;
	if (user.actions['Move Left']) dirX--;
	if (user.actions['Move Right']) dirX++;
	var tryingJump = (user.actions['Jump']) ? true : false;

	var ladderId = 3;

	var tiles = this.getTilesFromCollisionWithLayer(0);

	if ((dirY !== 0 || this.isOnLadder) && tiles.indexOf(ladderId) !== -1) {
		
		if (tryingJump) {
			this.isOnLadder = false;
			this.Vy = -this.jumpHeight;
			this.y += this.Vy;
			if (this.isCollisionWithLayer(1)) {
				while (this.isCollisionWithLayer(1))
					this.y -= Math.sign(this.Vy);
				this.Vy = 0;
			}
		} else {
			this.isOnLadder = true;
			this.Vy = 0;
			this.y += this.speed * dirY;
			if (this.isCollisionWithLayer(1) || (!this.getTilesFromCollisionWithLayer(0).includes(ladderId) && dirY === -1)) {
				while (this.isCollisionWithLayer(1) || !this.getTilesFromCollisionWithLayer(0).includes(ladderId))
					this.y -= dirY;
			} else if (dirY !== 0)
				this.animate('moveUp');
		}
	}
	else {
		this.isOnLadder = false;
		this.Vy++;
		this.y += this.Vy;

		var col = this.isCollisionWithLayer(1);
		if (col) {
			while (this.isCollisionWithLayer(1))
				this.y -= Math.sign(this.Vy);
			this.Vy = 0;

			if (tryingJump) {
				this.Vy -= this.jumpHeight;
				this.y += this.Vy;
				if (this.isCollisionWithLayer(1)) {
					while (this.isCollisionWithLayer(1))
						this.y -= Math.sign(this.Vy);
					this.Vy = 0;
				}
			}
		}
	}

	if (dirX !== 0) {
		this.x += this.speed * dirX;
		if (this.isCollisionWithLayer(1))
			while (this.isCollisionWithLayer(1))
				this.x -= dirX;
		else if (dirX === 1)
			this.animate('moveRight')
		else if (dirX === -1)
			this.animate('moveLeft')
	}
};

_p.isCollisionWithLayer = function (layerIndex) {
	var shadow = this.shadowRelativePosition;
	var layer = this._world._layers[layerIndex].data;
	var y1 = shadow.y / this._world.outputTileHeight | 0;
	var y2 = (shadow.y + shadow.height) / this._world.outputTileHeight | 0;
	var x1 = (shadow.x - shadow.width / 2) / this._world.outputTileWidth | 0;
	var x2 = (shadow.x + shadow.width / 2) / this._world.outputTileWidth | 0;

	for (var i = x1; i <= x2; i++) {
		for (var j = y1; j <= y2; j++) {
			var index = j * this._world.width + i;
			if (layer[index] !== 0)
				return true;
		}
	}
	return false;
};

_p.getTilesFromCollisionWithLayer = function (layerIndex) {
	var shadow = this.shadowRelativePosition;
	var layer = this._world._layers[layerIndex].data;
	var y1 = shadow.y / this._world.outputTileHeight | 0;
	var y2 = (shadow.y + shadow.height) / this._world.outputTileHeight | 0;
	var x1 = (shadow.x - shadow.width / 2) / this._world.outputTileWidth | 0;
	var x2 = (shadow.x + shadow.width / 2) / this._world.outputTileWidth | 0;

	var array = [];
	for (var i = x1; i <= x2; i++) {
		for (var j = y1; j <= y2; j++) {
			var index = j * this._world.width + i;
			array.push(layer[index]);
		}
	}
	return array;
};