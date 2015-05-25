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
	this._level = 0;
	audioManager = this._audioManager = new AudioManager();
	this._board = new Board();
	this._world = new World(this);
	var self = this;
	this._world.onload = function() {
		self._player = new Player(this);	
		self.nextFrame();
	};
	extend(this, new Timeline)
}

Game.prototype.nextFrame = function () {
	this._frame++;
	
	this.check();
	
	this._player.move();
	
	this._board.draw();
	this._world.drawLayers();	
	this._world.drawObjects();

	settings.areVisible && this._board.drawSettings();
	
	fps.count(ctx);
	window.requestAnimationFrame(this.nextFrame.bind(this));
	
};


function Timeline() {
	this._events = {};
    this._frame = 0;
}
Timeline.prototype.getCurrentFrameIndex = function() {
	return this._frame;
}
Timeline.prototype.addEvent = function(_frame, eventCallback, self) {
	_frame += this._frame;
    if (!this._events[_frame]) this._events[_frame] = [];
    this._events[_frame].push({
        fire: eventCallback,
        self: self
    });
};
Timeline.prototype.showEvents = function() {
	return this._events;
}
Timeline.prototype.check = function () {
    var f = this._events[this._frame]; // frame events
    if (f) {
        for (var i = 0; i < f.length; i++) {
            var event = f[i];
            event.fire.call(event.self);
        }
        delete this._events[this._frame];
    }
};