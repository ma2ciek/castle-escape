function Scene(board, o) {
	extend(this, new EventEmitter());
	this._board = board;

	this._isVivible = !!o.isVivible;
	this._zIndex = o.zIndex || 0;

	this._setDimensions(board, o);
	this._setOffset(board, o);

	this._bgColor = o.bgColor || null;
	if (o.bgImage)
		this._bgImage = board.imgManager[o.bgImage];

	this._objects = {};
	this._sortedObjects = [];

	for (var objName in o.objects) {
		this._objects[objName] = new SceneObject(this, objName, o.objects[objName]);
	}
	this._sortObjects();
}

Scene.prototype._setDimensions = function (board, o) {
	this._height = o.height || board.height;
	this._width = o.width || board.width;
};

Scene.prototype._setOffset = function (board, o) {
	this._left = o.left || board.width - o.right || 0;
	this._top = o.top || board.width - o.bottom || 0;

	if (o.alignCenter)
		this._left = (board.width - this._width) / 2;
	if (o.alignVertical)
		this._top = (board.height - this._height) / 2;
};

Scene.prototype.getBoard = function () {
	return this._board;
};

Scene.prototype.addObject = function (objName, o) {
	this._objects.push(new SceneObject(this, objName, o));
	this._sortObjects();
};

Scene.prototype._sortObjects = function () {
	this._sortedObjects = [];
	for (var objName in this._objects) {
		this._sortedObjects.push(this._objects[objName]);
	}
	this._sortedObjects.sort(function (o1, o2) {
		return o1._zIndex - o2._zIndex;
	});
};

Scene.prototype.draw = function () {
	if (this._bgColor) {
		ctx.fillStyle = this._bgColor;
		ctx.fillRect(this._left, this._top, this._width, this._height);
	}
	if (this._bgImage)
		ctx.drawImage(this._bgImage, this._left, this._top, this._width, this._height);
	for (var i = 0; i < this._sortedObjects.length; i++) {
		this._sortedObjects[i].draw();
	}
};

Scene.prototype.attr = function () {
	if (arguments.length === 1)
		return this['_' + arguments[0]];
	else {
		this['_' + arguments[0]] = arguments[1];
		return this;
	}
};

Scene.prototype.remove = function () {
	for (var objName in this._objects) {
		this._objects[objName].remove();
	}
};

Scene.prototype.hide = function () {
	this._isVivible = false;
};

Scene.prototype.show = function () {
	this._isVivible = true;
};

function SceneObject(_scene, objName, o) {
	this._scene = _scene;
	this._objName = objName;
	this._hoverStyles = {};

	this._addClassesStyles(o, objName);

	this._setEventListeners(o, objName);

	this._setDimensions(o);

	this._setShape(o);

	this._setBgImage(o);

	this._zIndex = (o.zIndex || 0) + this._scene.attr('zIndex');

	this._setText(o);

	this._createActiveObjectFromSelf();
}

var _p = SceneObject.prototype;

_p._addClassesStyles = function (o, class_name) {
	ext(class_name);

	function ext(class_name) {
		if (class_name in styles) {
			for (var prop in styles[class_name]) {
				if (prop === 'extend')
					ext(styles[class_name].extend);
				else
					o[prop] = styles[class_name][prop];
			}
		}
	}
};

_p._setEventListeners = function (o, objName) {

	var self = this;

	this._onClick = o.onClick && o.onClick.bind(this) || null;

	if (objName + 'Hover' in styles || o.onHover || o.onBlur) {

		this._setHoverStyle(objName + 'Hover');

		this._onHover = function () {
			o.onHover && o.onHover.call(self);
			self._hover = true;
			self._scene._trigger('dirt');
		};

		this._onBlur = function () {
			o.onBlur && o.onBlur.call(self);
			self._hover = false;
			self._scene._trigger('dirt');
		};
	}
};

_p._setHoverStyle = function (class_name) {
	var self = this;
	extHover(class_name);
	
	function extHover(class_name) {
		if (class_name in styles) {
			for (var prop in styles[class_name]) {
				if (prop === 'extend')
					extHover(styles[class_name].extend);
				else
					self._hoverStyles['_' + prop] = styles[class_name][prop];
			}
		}
	}
};

_p._setShape = function (o) {
	this._shape = o.shape || 'rect';
	this._cornerRadius = o.cornerRadius || 0;
	this._bgColor = o.bgColor || '';
	this._borderWidth = o.borderWidth || 0;
	this._borderColor = o.color || o.borderColor || 'black';
};

_p._setBgImage = function (o) {
	if (!o.bgImage)
		return;

	this._bgImage = o.bgImage;
	this._imgWidth = o.imgWidth || o.bgImage.width;
	this._imgHeight = o.imgHeight || o.bgImage.height;
};


_p._setDimensions = function (o) {
	this._left = (o.left || 0) + this._scene.attr('left');
	this._top = (o.top || 0) + this._scene.attr('top');
	this._width = o.width || this._scene.attr('width');
	this._height = o.height || this._scene.attr('height');
	if (o.alignCenter) {
		this._left += (this._scene.attr('width') - this._width) / 2;
	}
	if (o.alignVertical)
		this._top += (this._scene.attr('height') - this._height) / 2;
};

_p._setText = function (o) {
	this._text = o.text || '';
	if (!this._text)
		return;

	this._textFromLeft = (o.textFromLeft || 0) + this._left;
	this._textFromTop = (o.textFromTop || 0) + this._top;

	this._color = o.color || '#000';
	this._fontSize = o.fontSize || '12px';
	this._textBaseLine = o.textBaseline || 'top';
	this._fontFamily = o.fontFamily || 'Arial';
	this._textAlign = o.textAlign || 'left';
};



_p._createActiveObjectFromSelf = function () {
	this._ao = activeObjects.add({
		left: this._left,
		top: this._top,
		width: this._width,
		height: this._height,
		zIndex: this._zIndex,
		leftClick: this._onClick,
		onHover: this._onHover,
		onBlur: this._onBlur,
		fromCenter: false
	});
};

_p.draw = function () {
	var o = extend({}, this);
	
	o._hover && extend(o, o._hoverStyles);
	
	(o._bgColor || o._borderWidth > 0) && this._drawBackground(o);

	o._bgImage && this._drawBgImage(o);

	o._text && this._drawText(o);
};

_p._drawBackground = function (o) {
	ctx.lineWidth = o._borderWidth;
	ctx.strokeStyle = o._borderColor;
	ctx.fillStyle = o._bgColor;

	var isFill = !!o._bgColor;
	var isStroke = (o._borderWidth > 0);

	if (o._shape === 'rect') {
		ctx.roundRect(o._left, o._top, o._width, o._height, o._cornerRadius, isFill, isStroke);
	}
};

_p._drawBgImage = function (o) {
	var img = o._scene.getBoard().imgManager.get(o._bgImage);
	ctx.drawImage(img, o._left, o._top, o._imgWidth, o._imgHeight);
};

_p._drawText = function (o) {
	ctx.fillStyle = o._color;
	ctx.font = o._fontSize + ' ' + o._fontFamily;
	ctx.textBaseline = o._textBaseLine;
	ctx.textAlign = o._textAlign;
	ctx.fillText(o._text, o._textFromLeft, o._textFromTop);
};

_p.remove = function () {
	this._ao && this._ao.remove();
	delete this._scene[this._objName];
};

_p.attr = function () {
	if (arguments.length === 1)
		return this['_' + arguments[0]];
	else {
		this['_' + arguments[0]] = arguments[1];
		this._scene._trigger('dirt');
		return this;
	}
};

var styles = {

	// Main Page
	tile: {
		width: 160,
		height: 100,
		alignCenter: true,
		top: 430 - 160,
		color: '#6bf',
		textAlign: 'center',
		fontSize: '20px',
		textBaseline: 'middle',
		textFromTop: 100 / 2,
		textFromLeft: 160 / 2,
		zIndex: 2,
		cornerRadius: 30,
	},
	tileHover: {
		bgColor: '#00A',
		color: '#EEE',
		borderWidth: 4
	},
	castleImage: {
		left: 100,
		top: 50,
		bgImage: 'castle-in-clouds',
		imgWidth: 400,
		imgHeight: 390,
		zIndex: 1
	},
	title: {
		left: 530,
		top: 150,
		width: 160,
		zIndex: 2,
		text: 'Castle Escape',
		color: '#6bf',
		fontSize: '40px',
		textBaseline: 'middle'
	},
	sky: {
		height: 430,
		bgColor: '#05f'
	},
	ground: {
		top: 380,
		height: 500,
		bgColor: '#421'
	},
	HOME_author: {
		alignCenter: true,
		width: 100,
		top: 700,
		height: 40,
		color: '#CCC',
		text: "Maciej Bukowski, 2015"
	},
	play: {
		text: 'Play',
		left: 0,
		extend: 'tile'
	},
	playHover: {
		extend: 'tileHover'
	},
	resume: {
		left: 160,
		text: 'Continue',
		extend: 'tile'
	},
	resumeHover: {
		extend: 'tileHover'
	},
	credits: {
		text: 'Credits',
		left: 320,
		extend: 'tile'
	},
	creditsHover: {
		extend: 'tileHover'
	},
	settings: {
		text: 'Settings',
		left: 480,
		extend: 'tile'
	},
	settingsHover: {
		extend: 'tileHover'
	},


	// Credits
	author: {
		zIndex: 3,
		top: 100,
		width: 400,
		height: 50,
		alignCenter: true,
		text: "Author: Maciej Bukowski",
		textFromLeft: 200,
		textFromTop: 25,
		fontSize: "30px",
		color: "#999",
		textAlign: "center",
		textBaseline: "middle"
	},

	authorHover: {
		color: 'red',
	},

	bg: {
		zIndex: 2,
	},
	graphics: {
		extend: 'author',
		top: 200,
		text: 'Graphics:',
		zIndex: 1
	},
};