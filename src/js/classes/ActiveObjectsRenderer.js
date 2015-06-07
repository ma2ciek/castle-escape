function ActiveObjectsRenderer(ctx, manager) {
	this._ctx = ctx;
	this._AOManager = manager;
};

var _p = ActiveObjectsRenderer.prototype;

_p.renderAll = function() {
	var elements = this._AOManager.getAll();
	for (var i = 0; i < elements.length; i++) {
		var ao = elements[i];
		this.renderActiveObject(ao);
	}
}

_p.renderActiveObject = function(ao) {
	var isHover = this._isHover(ao);
	var classes = ao.getClasses();
	var aoStyle = extend({}, this._defaultStyle, ao.data());

	isHover && extend(aoStyle, ao.data('hover'));

	for(var className in classes) {
		var currentClass = classes[className];
		extend(aoStyle, currentClass);
	}

	
	aoStyle.bgColor && this._drawBackground(ao, aoStyle);
	aoStyle.innerText && this._drawText(ao, aoStyle);
}

_p._isHover = function(ao) {
	return ao === this._AOManager.getHover() &&
		typeof ao.data('hover') != 'undefined';
}

_p._drawBackground = function(ao, aoStyle) {
	this._ctx.fillStyle = aoStyle.bgColor;
	this._ctx.fillRect(ao.x, ao.y, ao.width, ao.height);
}

_p._drawText = function(ao, aoStyle) {
	var style = this._defaultStyle;
	var text = aoStyle['innerText'];

	this._ctx.textBaseline = aoStyle.textBaseline;
	this._ctx.font = aoStyle.textFont;
	this._ctx.fillStyle = aoStyle.textColor;
	this._ctx.textAlign = aoStyle.textAlign;

	var textOffsetLeft;

	switch(aoStyle.textAlign) {
		case 'left':
			textOffsetLeft = ao.x;
			break;
		case 'center':
			textOffsetLeft = ao.x + ao.width / 2;
			break;
		case 'right':
			textOffsetLeft = ao.x + ao.width;
			break;
		default:
			throw new Error('No such option')

	}

	var textHeight = this._ctx.measureText('M').width;
	var textOffsetTop = ao.y + (ao.height - textHeight) / 2;

	this._ctx.fillText(text, textOffsetLeft, textOffsetTop);
}

_p._defaultStyle = {
	textBaseline: 'hanging',
	textColor: '#000',
	textFont: '15px Arial',
	textAlign: 'center'
}

_p.renderScene = function(scene) {
	var ctx = this._ctx;

	var elements = this._AOManager.filter(function() {
		return this.data('scene') === scene;
	});

	for(var i=0; i<elements.length; i++) {
		var ao = elements[i];
		console.log(ao);
		this.renderActiveObject(ao);
	}
}