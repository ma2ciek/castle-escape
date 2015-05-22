function Board() {
	this.width = window.innerWidth;
	this.height = window.innerHeight;

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

Board.prototype.draw = function () {
	ctx.clearRect(0, 0, this.width, this.height);
}


Board.prototype.drawSettings = function () {
	
	if(!this._settingsCanvas) 
		this.updateSettingsCtx();
	ctx.drawImage(this._settingsCanvas, 0, 0);
}
Board.prototype.updateSettingsCtx = function() {
	var _canvas = this._settingsCanvas = document.createElement('canvas')
	var _ctx = this._settingsCtx = _canvas.getContext('2d');
	_canvas.height = this.height;
	_canvas.width = this.width;

	addAdditionalfunctionsToCtx(_ctx);
	
	this.createMask(_ctx);
	
	_ctx.style({
		textBaseline: 'top',
		font: '16px Calibri, Arial',
		fillStyle: 'white'
	});
	
	var offsetTop = 100;
	var offsetLeft = 100
	var options = settings.get();
	
	for(var i in options) {
		_ctx.fillText(i + ': ', offsetLeft, offsetTop);
		_ctx.fillText(options[i], 300, offsetTop);
		offsetTop += 20;		
	}
}


Board.prototype.createMask = function(ctx) {
	ctx.drawRect(0, 0, this.width, this.height, 'rgba(0, 0, 0, 0.5)' );	
}

