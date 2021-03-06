function Game() {
	BgAudio.call(this);
	extend(this, new EventEmitter());
	this._board = new Board();
	this._loadAudio();
}

extend(Game.prototype, BgAudio.prototype);

Game.prototype._loadAudio = function() {
	var self = this;
	loadJSON('data/audio.json').then(function(music) {
		// audio
		audioManager.add(music);
		audioManager._addEventListener('audioLoaded', self.onAudioLoaded.bind(self));
	});
};

Game.prototype.onAudioLoaded = function() {
	console.log(audioManager._list);
	this._setNavigation();
}

Game.prototype.play = function() {
	extend(this, new Timeline());
	this._pause = false;
	this._world = new World(this);
	var self = this;
	self._setBgAudio('game-music');
	this._world._addEventListener('loaded', function() {
		self._player = new Player(this);
		self._nextFrame();
	});
}

Game.prototype.pause = function() {
	this._pause = true;
	this._bgAudio && this._bgAudio.pause();
}

Game.prototype.resume = function() {
	this._pause = false;
	this._nextFrame();
	this._bgAudio && this._bgAudio.play();
}


Game.prototype._nextFrame = function() {
	/* global performance */
	try {
		var t1 = performance.now();
		this._frame++;

		this.check();

		this._world._turbulenceManager.setRandomValues();

		this._player.move();
		
		this._board.clear();
		
		
		
		this._world.drawLayers();
		
		
		
		this._world.drawObjects();

		this._board.drawScenes();
		var t2 = performance.now();
		$('#performance').html(t2-t1 | 0);
		//fps.count(ctx);
		//$('#performance2').html(t2-t1 | 0);

		if (!this._pause)
			window.requestAnimationFrame(this._nextFrame.bind(this));

	} catch (err) {
		console.log(err);
	}
};

Game.prototype.goToStartPage = function() {
	this._setBgAudio('start-music');
	this._board.createWelcomeScene();
}

Game.prototype.goToCreditsPage = function() {
	this._setBgAudio('start-music');
	this._board.createCreditsScene();
}

Game.prototype.goToSettingsPage = function() {
	this._setBgAudio('start-music');
	this._board.createSettingsScene();
}

Game.prototype._setNavigation = function() {
	var self = this;

	function hashChange(e) {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
		self._pause = true;
		self._board.removeScenes();

		activeObjects.removeAll();
		
		// removeSettings();

		var hash = location.hash.length === 0 ? '' : location.hash.slice(1);
		switch (hash) {
			case 'play':
				self.play();
				break;
			case '':
				self.goToStartPage();
				break;
			case 'credits':
				self.goToCreditsPage();
				break;
			case 'resume': 
				break;
			case 'settings':
				self.goToSettingsPage();
				break;
			default:
				console.error(hash);
				break;
		}
	}
	window.addEventListener('hashchange', hashChange);
	hashChange(); // trigger;
}