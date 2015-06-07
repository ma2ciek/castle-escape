function ImageManager() {
	extend(this, new EventEmitter());
	this._counter = 0;
	this._list = {};
}

var _p = ImageManager.prototype;

_p.add = function(o) {

	for(var imgName in o) {
		this._counter++;

		var img = this._list[imgName] = new Image();
		img.src = o[imgName];
		img.onload = this._onload.bind(this, imgName, img.src);
		img.onerror = this._onerror.bind(this, imgName, img.src);
	}
	return this;
}

_p._onload = function(imgName) {
	this._count();
}

_p._onerror = function(imgName, imgSrc) {
	this._trigger('error');
	console.error(imgName, imgSrc);
	this._count();
}

_p._count = function() {
	this._counter--;
	if(this._counter === 0)
		this._trigger('loaded');
}

_p.get = function(imgName) {
	return this._list[imgName];
}