var settings;
var actionsList = {};
var assignments;

function init() {
	settings = new Settings();
	assignments = settings.getAssignments();

	var li = $('li');
	console.log(li, li.length)
	for (var i = 0; i < li.length; i++) {

		li[i].addEventListener('click', function (e) {
			for (var i = 0; i < li.length; i++) {
				$(li).removeClass('active');
			}

			$(this).addClass('active');

			loadContent(this.id);

		})
	}
	li[0].click();
}

function loadContent(id) {
	var dest = document.getElementById('right-panel');


	$(dest).hide(100, function () {
		dest.className = '';
		dest.innerHTML = '';
		$(dest).addClass(id);

		$(dest).show(300);
		switch (id) {
			case 'controls':
				loadControls();
				addEventListeners();
				break;

			case 'audio':
				break;

			case 'video':
				break;

			default:
				throw (id)
		}
	});
}

function loadControls() {
	var dest = document.getElementById('right-panel');
	var list = assignments.getList();

	for (var action in list) {
		var outerDiv = document.createElement('div');
		$(outerDiv).addClass('binding');

		var div = document.createElement('div');
		$(div).addClass('action-name');
		div.innerHTML = action;
		outerDiv.appendChild(div);


		var div = document.createElement('div');
		actionsList[action] = div;
		$(div).addClass('key-name');
		div.innerHTML = list[action];
		outerDiv.appendChild(div);

		dest.appendChild(outerDiv);
	}
}

function addEventListeners() {
	window.addEventListener('click', function (e) {
		var div = document.getElementsByClassName('key-name active')[0];
		if (div)
			$(div).removeClass('active');

		if ($(e.target).hasClass('key-name')) {
			var action = e.target.previousElementSibling.innerHTML;

			assignments.setActiveBinding(action);
			$(e.target).addClass('active');
		}
	});

	window.addEventListener('keydown', function (e) {
		var div = document.getElementsByClassName('key-name active')[0];
		if (div) {
			assignments.tryBind(e.keyCode);
			e.preventDefault();
		}
	});

	assignments._addEventListener('changeAssignnment', function (action) {
		actionsList[action].innerHTML = assignments.getList()[action]
	})
}