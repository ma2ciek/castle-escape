/* global console */

document.addEventListener('init', function() {
	init();
});

var canvas,
	ctx,
	user,
	audioManager,
	settings,
	game,
	activeObjects,
	AORenderer;

function init() {
	canvas = document.getElementsByTagName('CANVAS')[0];
	ctx = canvas.getContext('2d');
	addAdditionalfunctionsToCtx(ctx);
	activeObjects = new ActiveObjectsManager(canvas);
	activeObjects.watch();
	AORenderer = new ActiveObjectsRenderer(ctx, activeObjects);
	settings = new Settings();
	audioManager = new AudioManager();
	user = new User();
	game = new Game();
}