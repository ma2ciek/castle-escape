function SettingsGUI(html) {
	this._div = $('div').html(html)[0];
	this._div.id = 'settings';
	document.body.appendChild(this._div);

	this._actionsList = {};
	this._assignments = settings.getAssignments();
	var li = document.getElementsByTagName('li');
	var self = this;
	for (var i = 0; i < li.length; i++) {
		li[i].addEventListener('click', self._selectMenuClickHandler.bind(self));
	}

	li[0].click();
}

var _p = SettingsGUI.prototype;

_p._selectMenuClickHandler = function (e) {
	var li = document.getElementsByTagName('li');
	for (var i = 0; i < li.length; i++) {
		$(li).removeClass('active');
	}
	$(e.target).addClass('active');
	this._loadContent(e.target.id);
};

_p._loadContent = function (id) {
	var self = this;
	var dest = document.getElementById('right-panel');
	$(dest).hide(100, function () {
		dest.className = '';
		$(dest).html('').addClass(id);

		$(dest).show(300);

		if (id === 'controls') {
			self._loadControls();
			self._addBindingsEventListeners();
		}
		else {
			self._createSettings(id);
		}
	});
};

_p._createSettings = function (settingsType) {
	var options = settings.getAll();
	var dest = document.getElementById('right-panel');

	for (var optionName in options) {
		if(!options.hasOwnProperty(optionName))
			continue;
			
		var op = options[optionName];
		if(op.settingsType !== settingsType)
			continue;
		
		var div = $('div').html(op.niceName)[0];
		dest.appendChild(div);
		
		var input = $('input')[0];
		dest.appendChild(input);
		
		input.type = op.inputType;
		
		switch (op.inputType) {
			case 'range':
				input.min = op.minValue;
				input.max = op.maxValue;
				input.step = op.step;
				input.value = op.value;
				break;
			case 'button':
				input.value = op.value;
				break;
		}
		input.onmouseup = inputChange;
		input.setAttribute('data-option-name', optionName);		
	}

	function inputChange() {
		var optionName = this.getAttribute('data-option-name');
		var value = this.value;	
		settings.setPropValue(optionName, value);
	}
};


_p._loadControls = function () {
	var dest = document.getElementById('right-panel');
	var list = this._assignments.getList();

	for (var action in list) {
		var outerDiv = $('div')[0];
		$(outerDiv).addClass('binding');

		var div = $('div')[0];
		$(div).html(action).addClass('action-name');
		outerDiv.appendChild(div);


		div = $('div')[0];
		this._actionsList[action] = div;
		$(div).html(list[action]).addClass('key-name');
		outerDiv.appendChild(div);

		dest.appendChild(outerDiv);
	}
};

_p._addBindingsEventListeners = function () {
	var self = this;
	window.addEventListener('click', function (e) {
		self._clickHandler.call(self, e);
	});
	window.addEventListener('keydown', function (e) {
		self._keydownHandler.call(self, e);
	});
	this._assignments._addEventListener('changeAssignnment', function (action) {
		self._changeAssignmentHandler.call(self, action);
	});
};

_p._removeEventListeners = function () {
	// window.removeEventListener('click', clickHandler);
	// window.removeEventListener('keydown', keydownHandler);
	// this._assignments._removeEventListener('changeAssignnment', changeAssignmentHandler);
};

_p._changeAssignmentHandler = function (action) {
	this._actionsList[action].innerHTML = this._assignments.getList()[action];
};

_p._clickHandler = function (e) {
	var div = document.getElementsByClassName('key-name active')[0];
	if (div)
		$(div).removeClass('active');

	if ($(e.target).hasClass('key-name')) {
		var action = e.target.previousElementSibling.innerHTML;

		this._assignments.setActiveBinding(action);
		$(e.target).addClass('active');
	}
};

_p._keydownHandler = function (e) {
	var div = document.getElementsByClassName('key-name active')[0];
	if (div) {
		this._assignments.tryBind(e.keyCode);
		e.preventDefault();
	} else if (user.actions.Settings) {
		this._removeEventListeners();
		$(document.getElementById('settings')).remove();
		$(document.getElementById('settings-style')).remove();
	}
};