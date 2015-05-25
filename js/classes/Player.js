function Player(world) {
	var self = this;
	this._world = world;
	this.x = 200;
	this.y = 200;
	this.width = 48;
	this.height = 92;
	this.speed = 3;
	this.shadowRelativePosition = {
		get x() { return self.x + 15 },
		get y() { return self.y + 72 },
		get width() { return 30 },
		get height() { return 20 },
	};
	
	this.sprite = world._sprites['player'];
	
	this.view = 'moveRight';
	this.audio = 'road';
	this._frameDuration = 5;


	extend(this, new Animator);
	extend(this, new EventEmitter);
	
	// Get prototype functions of GameObject
	extend(this, GameObject.prototype);

	world.addObject(this);
}

Player.prototype.move = function () {
	var dirX = 0;
	var dirY = 0;

	var oldX = this.x;
	var oldY = this.y;

	if (user.keys[38] || user.keys[87]) dirY--;
	if (user.keys[40] || user.keys[83]) dirY++;
	if (user.keys[37] || user.keys[65]) dirX--;
	if (user.keys[39] || user.keys[68]) dirX++;

	if (dirX !== 0 || dirY !== 0) {
		var v = new Vector(dirX, dirY * this._world.tileFactor);
		this.x += this.speed * v.unit.x;
		this.y += this.speed * v.unit.y;
	}
	
	// Collisions
	for (var i = 0; i < this._world._objectsOnScreen.length; i++) {
		var o = this._world._objectsOnScreen[i];
		if (o instanceof this.constructor) continue;
		if (RectCollision(this.shadowRelativePosition, o)) {
			o.actions && o.actions.playeron && o.action(o.actions.playeron);
		}
	}
	
	
	// Animation	
	if (dirX === 1 && dirY === 0) this.animate('moveRight')
	else if (dirX === 1 && dirY === -1) this.animate('moveUpRight')
	else if (dirX === 1 && dirY === 1) this.animate('moveDownRight')
	else if (dirX === 0 && dirY === 1) this.animate('moveDown')
	else if (dirX === 0 && dirY === -1) this.animate('moveUp')
	else if (dirX === -1 && dirY === 0) this.animate('moveLeft')
	else if (dirX === -1 && dirY === -1) this.animate('moveUpLeft')
	else if (dirX === -1 && dirY === 1) this.animate('moveDownLeft')
};