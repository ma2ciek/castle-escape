/* global User */
/* global $ */
document.addEventListener('init', function () {
	init();
});

var canvas,
	ctx,
	user,
	audioManager,
	game;

function init() {
	canvas = document.getElementsByTagName('CANVAS')[0];
	ctx = canvas.getContext('2d');
	
	addAdditionalfunctionsToCtx(ctx);
	
	settings.init(ctx);
	
	
	user = new User();
	game = new Game();
}

function Game() {
	this.frame = 0;
	this._level = 0;
	audioManager = this._audioManager = new AudioManager();
	this._board = new Board();
	this._world = new World(this);
	var self = this;
	this._world.onload = function() {
		self._player = new Player(this);	
		self.nextFrame();
	};
	
}

Game.prototype.nextFrame = function () {
	this.frame++;

	this._player.move();
	
	this._board.draw();
	this._world.drawLayers();	
	this._world.drawObjects();

	settings.areVisible && this._board.drawSettings();
	
	fps.count(ctx);
	window.requestAnimationFrame(this.nextFrame.bind(this));
};





function EventHandler() {
	this._events = [];
}


function GameEvent() {
	
}

GameEvent.prototype.trigger = function() {
	
}