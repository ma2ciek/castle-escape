function TurbulenceManager(maxScreenDelta) {
	this._turbulences = [];
	this._maxScreenDelta = maxScreenDelta;
}

var _p = TurbulenceManager.prototype;

_p.getDelta = function() {
	var x = 0;
	var y =0;
	for(var i=0; i<this._turbulences.length; i++) {
		this.x += this._turbulences[i].getX();
		this.y += this._turbulances[i].getY();
	}
	if(Math.abs(x) > this._maxScreenDelta)
		x = x / Math.abs(x) * this._maxScreenDelta;

	if(Math.abs(y) > this._maxScreenDelta)
		y = y / Math.abs(y) * this._maxScreenDelta;

	return {
		x: x,
		y: y
	}
};

_p.setRandomValues = function() {
	for(var i=0; i<this._turbulences.length; i++) {
		this._turbulences[i].setRandomValues();
	}
};

_p.add = function(time, altitude) {
	this._turbulences.push(new Turbulence(time, altitude));
}

function Turbulence(time, altitude) {
	this._timeleft = time;
	this._altitude = altitude;
	this._x = 0;
	this._y = 0;
	this.setRandomValues();
}

_p = Turbulence.prototype;

_p.setRandomValues = function() {
	this._x = (2 * Math.random() - 1) * this._altitude;
	this._y = (2 * Math.random() - 1) * this._altitude;
};

_p.getX = function() {
	return this._x;
};

_p.getY = function() {
	return this._y;
};