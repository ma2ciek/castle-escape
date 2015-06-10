function GameObject(_world, properties) {
	extend(this, new EventEmitter());
	switch (properties.name) {
		default:
			break;
	}
	extend(this, properties);
}

GameObject.prototype.draw = function() {
	var animation = this.animations[this.currentAnimationName];
	
	// Do poprawy
	var relPos = game._world.relativate(this.x, this.y);
	
	var frame = animation.getCurrentFrame();
	
	ctx.drawImage(frame.image, 
		frame.x, frame.y, frame.width, frame.height, 
		relPos.x, relPos.y, frame.width, frame.height);
}