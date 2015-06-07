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

Board.prototype.removeScenes = function(scene) {
	for (var i = 0; i < this._scenes.length; i++) {
		this._scenes[i].remove();
	}
	this._scenes.length = 0;
	console.log(this._scenes);
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
	var assignmentsGUI = settings.assignmentsGUI;

	assignmentsGUI._addEventListener('dirt-window', function() {
		self.clear();
		AORenderer.renderScene('Controls');
	});

	window.addEventListener('keydown', function(e) {
		var success = settings.assignments.tryBind(e.keyCode)
		if (success) 
			e.preventDefault();
	});

	window.addEventListener('resize', function(e) {
		var height = Math.max(assignmentsGUI.getMinHeight(), window.innerHeight);
		assignmentsGUI._trigger('dirt-window');
	})

	assignmentsGUI.createActiveObjects();
	assignmentsGUI._trigger('dirt-window');

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