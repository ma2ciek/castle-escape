function init() {
	getCanvas();
	
	var AOManager = new ActiveObjectsManager(canvas);
	AOManager.watch();

	var AORenderer = new ActiveObjectsRenderer(ctx, AOManager);

	assignments = new Assignments();

	assignmentsGUI = new AssignmentsGUI(assignments, AOManager, {
		offsetTop: 50,
		descriptionWidth: 150,
		offsetLeft: 100,
		tileHeight: 50,
		tileWidth: 200,
		tileMargin: 10,
		paddingBottom: 50
	});

	assignmentsGUI._addEventListener('dirt-window', function() {
		clearCanvas();
		AORenderer.renderAll();
	});

	assignmentsGUI.createActiveObjects();

	

	resize();

	setEventListeners();
}
var assignments, assignmentsGUI;
var canvas, ctx;

function getCanvas() {
	canvas = document.getElementsByTagName('CANVAS')[0];
	ctx = canvas.getContext('2d');
}

function resizeCanvas(x, y) {
	canvas.width = x || window.innerWidth;
	canvas.height = y || window.innerHeight;
}

function clearCanvas() {
	ctx.fillStyle = '#333';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function setEventListeners() {
	window.addEventListener('keydown', function(e) {
		var keyCode = e.keyCode;
		var success = assignments.tryBind(keyCode)
		if (success) {
			e.preventDefault();
		}
	});

	window.addEventListener('resize', resize);
}

function resize() {
	var height = Math.max(assignmentsGUI.getMinHeight(), window.innerHeight);
	resizeCanvas(false, height);
	assignmentsGUI._trigger('dirt-window');
}