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

	fps.count(ctx);
	window.requestAnimationFrame(this.nextFrame.bind(this));
};

function Board() {
	this.width = window.innerWidth;
	this.height = window.innerHeight;

	this.init();
	this.resize();
}

Board.prototype.resize = function () {
	var self = this;
	function resize() {
		self.width = canvas.width = document.documentElement.clientWidth || document.body.clientWidth;
		self.height = canvas.height = document.documentElement.clientHeight || document.body.clientHeight;
	}
	window.addEventListener('resize', resize);
	resize();
};

Board.prototype.init = function () {
	canvas = document.getElementsByTagName('CANVAS')[0];
	ctx = canvas.getContext('2d');
}

Board.prototype.draw = function () {
	ctx.clearRect(0, 0, this.width, this.height);
}