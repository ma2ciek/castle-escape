function World() {
	this._layers = [];
	this._tileSets = [];
	this._sprites = {};
	this._objects = [];
	this._objectsOnScreen = [];
	this._counter = 3;
	this._loadLayers();
	this._loadSprites().next(this._loadObjects.bind(this));
}

World.prototype._countLoadedFiles = function () {
	if ((--this._counter) === 0) {
		this.onload && this.onload.call(this);
	}
}

World.prototype._loadLayers = function () {
	var _callback = null;
	loadJSON('data/map.json', function (data) {
		this.width = data.width;
		this.height = data.height;
		this.outputTileWidth = data.tilewidth;
		this.outputTileHeight = data.tileheight;
		this.tileFactor = this.outputTileHeight / this.outputTileWidth;
		
		// Do zmiany na tablicę dwuwymiarową (?)
		this._layers = data.layers;
		this._createMapFromImportedData(data.layers);
		
		for (var i = 0; i < data.tilesets.length; i++) {
			var tileSetProperties = data.tilesets[i];
			this._tileSets.push(new TileSet(tileSetProperties))
		}
		this._countLoadedFiles();
		_callback && _callback.call(this);
	}.bind(this));
	return {
		next: function (callback) {
			_callback = callback;
			return this;
		}
	}
}

World.prototype._loadSprites = function () {
	var _callback = null;
	loadJSON('data/sprites.json', function (sprites) {
		for (var i in sprites) {
			this._sprites[i] = new Sprite(sprites[i]);
		}
		this._countLoadedFiles();
		_callback && _callback.call(this);
	}.bind(this));
	return {
		next: function (callback) {
			_callback = callback;
			return this;
		}
	}
}

World.prototype._loadObjects = function () {
	var _callback = null;
	loadJSON('data/objects.json', function (objectsList) {
		for (var i = 0; i < objectsList.length; i++) {
			this._objects.push(new GameObject(this, objectsList[i]));
		}
		this._countLoadedFiles();
		_callback && _callback.call(this);
	}.bind(this));
	return {
		next: function (callback) {
			_callback = callback;
			return this;
		}
	}
}

World.prototype._createMapFromImportedData = function(layers) {
	this._map = CreateArray(layers.length, this.width*2, this.width*2);
	for(var i=0; i<layers.length; i++) {
		var data = layers[i].data;
		var w = this.width;
		var w2 = this.width * 2;
		for(var n=0; n<data.length; n++) {
			this._map[i][w + n%w - Math.floor(n/w2)][n%w + Math.floor(1/2 + n/w2)] = data[n];
		}
	}
}

World.prototype.drawLayers = function () {

	var startX = Math.floor((game._player.x - game._board.width / 2) / this.outputTileWidth - 1);
	var startY = Math.floor((game._player.y - game._board.height / 2) / this.outputTileHeight * 2 - 1);
	var endX = Math.ceil((game._player.x + game._board.width / 2) / this.outputTileWidth);
	var endY = Math.ceil((game._player.y + game._board.height / 2) / this.outputTileHeight * 2);

	startX = Math.max(0, startX);
	startY = Math.max(0, startY);
	endX = Math.min(this.width, endX);
	endY = Math.min(this.height, endY);

	for (var i = 0; i < this._layers.length; i++) {
		var importedMap = this._layers[i].data;
		for (var y = startY; y < endY; y++) {
			for (var x = endX - 1; x >= startX; x--) {

				var screenX = x * this.outputTileWidth + game._board.width / 2 - game._player.x;
				var screenY = y * this.outputTileHeight / 2 + game._board.height / 2 - game._player.y;

				if (y % 2 === 1) screenX += this.outputTileWidth / 2;

				this._tileSets[0].draw(screenX, screenY, importedMap[this.width * y + x])
			}
		}
	}
}

World.prototype.drawObjects = function () {
	this._objectsOnScreen = [];
	this._objects.sort(function (o1, o2) {
		return (o1.y + o1.height) - (o2.y + o2.height);
	});
	for (var i = 0; i < this._objects.length; i++) {
		this._objectsOnScreen.push(this._objects[i]); // Do zmiany!!
		var object = this._objects[i];
		object.draw();
	}
}


/***** GAME OBJECT CLASS *****/
function GameObject(_world, properties) {
	if (_world === undefined) return;

	extend(this, properties);

	if (this.isAnimated) {
		this.sprite = _world._sprites[this.name];
		this.height = this.sprite.frameHeight;
		this.width = this.sprite.frameWidth;
		this.animator = new Animator({
			sprite: this.sprite,
			duration: 3,
			view: this.view
		});
	} else extend(this, new StaticImage(this));
	
}

GameObject.prototype.draw = function () {
	var translatedPos = relativate(this.x, this.y);

	if (this.sprite) {
		this.sprite.drawFrame(ctx, this.animator.getOffsetLeft(), this.animator.getOffsetTop(),
			translatedPos.x, translatedPos.y);
	}
}

function StaticImage(self) {
	this.image = new Image();
	this.image.onload = function () {
		console.log(this)
		self.width = self.image.width;
		self.height = self.image.height;
	}.bind(this, self);
	this.image.src = self.url;
}

StaticImage.prototype.draw = function() {
	var translatedPos = relativate(this.x, this.y);
	ctx.drawImage(this.image, translatedPos.x, translatedPos.y);
};


World.prototype.addObject = function (o) {
	this._objects.push(o);
};

/***** TILESET CLASS *****/
function TileSet(tileSetProperties) {
	extend(this, tileSetProperties);
	this.load();
}

TileSet.prototype.load = function () {
	this.rows = this.imageheight / this.tileheight;
	this.cols = this.imagewidth / this.tilewidth;

	this.img = new Image();
	this.img.src = this.image;
}
TileSet.prototype.draw = function (screenX, screenY, index) {
	index -= this.firstgid;

	var left = (index % this.cols) * this.tilewidth;
	var top = (index / this.cols | 0) * this.tileheight;

	ctx.drawImage(this.img, left, top, this.tilewidth, this.tileheight,
		screenX, screenY, this.tilewidth, this.tileheight
		);
}
