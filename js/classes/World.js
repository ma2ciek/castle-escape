/* global Sprite */
/* global loadJSON */
function World(game) {
	this._game = game;
	this._layers = [];
	this._tileSets = [];
	this._sprites = {};
	this._objects = [];
	this._objectsOnScreen = [];
	this._objectTypes = [];
	this._loadData();
}

World.prototype._loadData = function () {
	loadJSON('data/audio.json', 'data/sprites.json', 'data/objects.json', 'data/objects_on_map.json', 'data/test_map.json')
		.then(function (music, sprites, objects, map_objects, map) {
			
		// map
		this.width = map.width;
		this.height = map.height;
		this.outputTileWidth = map.tilewidth;
		this.outputTileHeight = map.tileheight;
		this.tileFactor = this.outputTileHeight / this.outputTileWidth;
		this._layers = map.layers;
		this._createMapFromImportedData(map.layers);

		for (var i = 0; i < map.tilesets.length; i++) {
			this._tileSets.push(new TileSet(map.tilesets[i]))
		}

		this._createStaticObjects(map, this);
		
		// audio
		this._game._audioManager.add(music);
		
		// sprites
		for (var prop in sprites) {
			this._sprites[prop] = new Sprite(sprites[prop]);
		}
		
		// objects
		
		this._objectTypes = objects;

		for (var i = 0; i < map_objects.length; i++) {
			this.addObject(new GameObject(this, map_objects[i]));
		}
		
		// callback
		this.onload && this.onload.call(this);
	}.bind(this));
}

World.prototype._createMapFromImportedData = function (layers) {
	this._map = CreateArray(layers.length, this.width * 2, this.width * 2);
	for (var i = 0; i < layers.length; i++) {
		var data = layers[i].data;
		if (data) {
			var w = this.width;
			var w2 = this.width * 2;
			for (var n = 0; n < data.length; n++) {
				var x = w + n % w - Math.floor(n / w2);
				var y = n % w + Math.floor(1 / 2 + n / w2);
				this._map[i][x][y] = data[n];
			}
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
		var l = this._layers[i];
		if (l.data && l.properties && l.properties.isVisible === 'true') {
			for (var y = startY; y < endY; y++) {
				for (var x = endX - 1; x >= startX; x--) {

					var screenX = x * this.outputTileWidth + game._board.width / 2 - game._player.x;
					var screenY = y * this.outputTileHeight / 2 + game._board.height / 2 - game._player.y;

					if (y % 2 === 1) screenX += this.outputTileWidth / 2;

					this._tileSets[i].draw(screenX, screenY, l.data[this.width * y + x])
				}

			}
		}
	}
}

World.prototype.drawObjects = function () {
	this._objectsOnScreen = [];
	this._objects.sort(function (o1, o2) {
		if ((o1.y + o1.height) - (o2.y + o2.height) === 0 ) {
			console.log(o1.x - o2.x)
			if(o1.x === o2.x) debugger;
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
	var imageArray = [];
	for (var i = 0; i < map.tilesets.length; i++) {
		var t = map.tilesets[i];
		if (!t.hasOwnProperty('image')) {
			for (var index in t.tiles) {
				imageArray[+index + +t.firstgid] = t.tiles[index].image;
			}
		}
	}


	for (var i = 0; i < map.layers.length; i++) {
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






/***** GAME OBJECT CLASS *****/
function GameObject(_world, properties) {
	if (_world === undefined) return;

	if (properties.name && properties.name in _world._objectTypes) {
		extend(this, _world._objectTypes[properties.name]);
	}
	
	console.log(this);
	
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
GameObject.prototype.animate = function (actions) {

	if (this.animator && this.animator.end) return;
	if (actions.requiredKey && !(user.keys[actions.requiredKey])) return;

	var automat = {
		audio: function (audioName) {
			audioManager.list[audioName].play();
		},
		animation: function () {
			this.animator.animate(value)
		},
		once: function () {
			this.inActive = true;
		},
		requiredKey: function () {

		}
	}



	for (var actionType in actions) {
		var value = actions[actionType];
		automat[actionType].call(this, value);
	}


}

function StaticImage(self) {
	this.image = new Image();
	this.image.onload = function () {
		self.width = self.image.width;
		self.height = self.image.height;
	}.bind(this, self);
	this.image.src = self.url;
}

StaticImage.prototype.draw = function () {
	var translatedPos = relativate(this.x, this.y);
	this.image.width > 0 && ctx.drawImage(this.image, translatedPos.x, translatedPos.y);
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