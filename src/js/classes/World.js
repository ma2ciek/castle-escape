function World(game) {
	this._game = game;
	this._layers = [];
	this._tileSets = [];
	this._sprites = {};
	this._objects = [];
	this._objectsOnScreen = [];
	this._objectTypes = [];
	this._loadData();
	extend(this, new EventEmitter());
}

World.prototype._loadData = function () {
	var self = this;
	loadJSON('data/castle.json')
		.then(function (map) {
		// map
		self.width = map.width;
		self.height = map.height;
		self.outputTileWidth = map.tilewidth;
		self.outputTileHeight = map.tileheight;
		self.tileFactor = self.outputTileHeight / self.outputTileWidth;
		self._layers = map.layers;
		self._createMapFromImportedData(map.layers);

		for (var i = 0; i < map.tilesets.length; i++) {
			self._tileSets.push(new TileSet(map.tilesets[i]))
		}

		self._createStaticObjects(map, self);
		
		self._trigger('loaded');
	});
}

World.prototype._createMapFromImportedData = function (layers) {
	this._map = createArray(layers.length, this.width, this.width);
	for (var i = 0; i < layers.length; i++) {
		var data = layers[i].data;
		if (data) {
			var w = this.width;
			for (var n = 0; n < data.length; n++) {
				var x = n % w;
				var y = n / w | 0;
				this._map[i][x][y] = data[n];
			}
		}
	}
}

World.prototype.drawLayers = function () {

	var startX = Math.floor((game._player.x - game._board.width / 2) / this.outputTileWidth - 1);
	var startY = Math.floor((game._player.y - game._board.height / 2) / this.outputTileHeight - 1);
	var endX = Math.ceil((game._player.x + game._board.width / 2) / this.outputTileWidth + 1);
	var endY = Math.ceil((game._player.y + game._board.height / 2) / this.outputTileHeight + 1);

	
	startX = Math.max(0, startX);
	startY = Math.max(0, startY);
	endX = Math.min(this.width, endX);
	endY = Math.min(this.height, endY);

	for (var i = 0; i < this._layers.length; i++) {
		var l = this._layers[i];
		if (l.data) {
			for (var y = startY; y < endY; y++) {
				for (var x = endX - 1; x >= startX; x--) {

					var relPosition = relativate(x * this.outputTileWidth, y * this.outputTileHeight)
					var screenX = relPosition.x;
					var screenY = relPosition.y;
					// UWAGA - 0
					this._tileSets[0].draw(screenX, screenY, l.data[this.width * y + x])
				}

			}
		}
	}
}

World.prototype.drawObjects = function () {
	this._objectsOnScreen = [];
	this._objects.sort(function (o1, o2) {
		if ((o1.y + o1.height) - (o2.y + o2.height) === 0 ) {
			return o1.x - o2.x
		}
		else return (o1.y + o1.height) - (o2.y + o2.height) ;
	});
	for (var i = 0; i < this._objects.length; i++) {
		this._objectsOnScreen.push(this._objects[i]); // Do zmiany!!
		var object = this._objects[i];
		object.draw();
	}
}
World.prototype._createStaticObjects = function (map) {
	var i, 
		imageArray = [];

	for (i = 0; i < map.tilesets.length; i++) {
		var t = map.tilesets[i];
		if (!t.hasOwnProperty('image')) {
			for (var index in t.tiles) {
				imageArray[(+index) + (+t.firstgid)] = t.tiles[index].image;
			}
		}
	}

	for (i = 0; i < map.layers.length; i++) {
		var currentLayer = map.layers[i];
		if (currentLayer.objects) {
			for (var j = 0; j < currentLayer.objects.length; j++) {
				var currentObject = currentLayer.objects[j];
				var go = new GameObject(this, {
					url: imageArray[currentObject.gid],
					x: currentObject.x,
					y: currentObject.y - currentObject.height,
					visible: currentObject.visible,
					name: currentObject.name
				});

				this.addObject(go)
			}
		}
	}
}

World.prototype.addObject = function (o) {
	this._objects.push(o);
};




/***** TILESET CLASS *****/
function TileSet(tileSetProperties) {
	extend(this, tileSetProperties);
	this.load();
}

TileSet.prototype.load = function () {
	if (this.image) {
		this.rows = this.imageheight / this.tileheight;
		this.cols = this.imagewidth / this.tilewidth;

		this.img = new Image();
		this.img.src = this.image;
	}
	else {
		this.images = [];
		for (var index in this.tiles) {
			var i = new Image();
			i.src = this.tiles[index].image;
			this.images.push(i);
		}
	}
}

TileSet.prototype.draw = function (screenX, screenY, index) {
	index -= this.firstgid;

	var left = (index % this.cols) * this.tilewidth;
	var top = (index / this.cols | 0) * this.tileheight;
	
	ctx.drawImage(this.img, left, top, this.tilewidth, this.tileheight,
		screenX, screenY, this.tilewidth, this.tileheight
		);
}