function Board() {
	this._scenes = [];
	extend(this, new EventEmitter());
	this.imgManager = new ImageManager();
	this.width = window.innerWidth;
	this.height = window.innerHeight;
	this.resize();

	var self = this;

	this.imgManager.add({
		'castle-in-clouds': './img/castle-in-clouds.png'
	})._addEventListener('loaded', function() {
		self.redrawScenes();
	});
}

Board.prototype.resize = function() {
	var self = this;

	function resize() {

		self.width = canvas.width = document.documentElement.clientWidth || document.body.clientWidth;
		self.height = canvas.height = document.documentElement.clientHeight || document.body.clientHeight;
		self.redrawScenes();
	}
	window.addEventListener('resize', resize);
	resize();
};

Board.prototype.clear = function() {
	ctx.fillStyle = '#000';
	ctx.fillRect(0, 0, this.width, this.height);
};

Board.prototype.drawScenes = function() {
	for (var i = 0; i < this._scenes.length; i++) {
		this._scenes[i].draw();
	}
};

Board.prototype.redrawScenes = function() {
	ctx.clearRect(0, 0, this.width, this.height);
	this.drawScenes();
}

Board.prototype._addScene = function(scene) {
	var self = this;
	this._scenes.push(scene);
	this._scenes.sort(function(s1, s2) {
		return s1.zIndex - s2.zIndex;
	});
	scene._addEventListener('dirt', self.redrawScenes.bind(self));
	this.redrawScenes();
};

Board.prototype._removeScene = function(scene) {
	scene.remove();
	this._scenes.splice(this._scenes.indexOf(scene));
	this.redrawScenes();
};

Board.prototype.removeScenes = function() {
	for (var i = 0; i < this._scenes.length; i++) {
		this._scenes[i].remove();
	}
	this._scenes.length = 0;
}

Board.prototype.createWelcomeScene = function() {
	this._addScene(new Scene(this, {
		objects: {
			castleImage: {},
			title: {},
			sky: {},
			ground: {},
			HOME_author: {},
			play: {
				onClick: function() {
					location.hash = 'play';
				}
			},
			resume: {
				onClick: function() {
					location.hash = 'continue';
				}
			},
			credits: {
				onClick: function() {
					location.hash = 'credits';
				},
			},
			settings: {
				onClick: function() {
					location.hash = 'settings';
				}
			}
		}
	}));
};


Board.prototype.createSettingsScene = function() {
	var self = this;

	var xhr = new XMLHttpRequest();
	xhr.onload = function() {
		var html = this.response;
		self.settingsGUI = new SettingsGUI(html);
	};
	xhr.open("GET", 'html/settings/index.html');
	xhr.send();
	
	var xhr2 = new XMLHttpRequest();	
	xhr2.onload = function() {
		var style = document.createElement('style');
		style.innerHTML = this.response;
		style.id = 'settings-style';
		document.head.appendChild(style);
	};
	xhr2.open('GET', './html/settings/style.css');
	xhr2.send();
};

Board.prototype.createCreditsScene = function() {
	this._addScene(new Scene(this, {
		bgColor: '#000',
		zIndex: 6,
		objects: {
			bg: {
				onClick: function() {
					location.hash = '';
				}
			},
			author: {
				onClick: function() {
					location.href = 'http://www.google.com'
				}
			},
			graphics: {

			}
		}
	}));
};