function TurbulenceManager(maxScreenDelta) {
	this._turbulences = [];
	this._maxScreenDelta = maxScreenDelta;
}

var _p = TurbulenceManager.prototype;

_p.getDelta = function () {
	var x = 0;
	var y = 0;
	for (var i = 0; i < this._turbulences.length; i++) {
		x += this._turbulences[i].getX();
		y += this._turbulences[i].getY();
	}
	if (Math.abs(x) > this._maxScreenDelta)
		x = x / Math.abs(x) * this._maxScreenDelta;

	if (Math.abs(y) > this._maxScreenDelta)
		y = y / Math.abs(y) * this._maxScreenDelta;

	return {
		x: x,
		y: y
	}
};

_p.setRandomValues = function () {
	for (var i = 0; i < this._turbulences.length; i++) {
		this._turbulences[i].setRandomValues();
	}
};

_p.add = function (time, altitude) {
	var t = new Turbulence(time, altitude);
	this._turbulences.push(t);
	this._setExpiredEventListener(t);
};

_p._setExpiredEventListener = function (t) {
	var self = this;
	t._addEventListener('expired', function () {
		var index = self._turbulences.indexOf(this);
		self._turbulences.splice(index, 1);
	}.bind(this));
};

function Turbulence(time, altitude) {
	extend(this, new EventEmitter());
	this._timeLeft = time;
	this._altitude = altitude;
	this._x = 0;
	this._y = 0;
	this.setRandomValues();
	this.vibrate();
}
_p = Turbulence.prototype;

_p.vibrate = function() {
	if(user.vibrate && settings.getPropValue('vibration'))
		user.vibrate(time * 60); 
};

_p.setRandomValues = function () {
	this._timeLeft--;
	if (this._timeLeft <= 0)
		this._trigger('expired');
		
	this._x = (2 * Math.random() - 1) * this._altitude;
	this._y = (2 * Math.random() - 1) * this._altitude;
};

_p.getX = function () {
	return this._x;
};

_p.getY = function () {
	return this._y;
};