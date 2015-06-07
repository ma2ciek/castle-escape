function AssignmentsGUI(assignments, AOManager, properties) {
	extend(this, new EventEmitter());
	this._assignments = assignments;
	this._AOManager = AOManager;
	this._activeObjects = {};
	this._restoreButtonActiveObject = null;

	this._descriptionWidth = properties.descriptionWidth;
	this._offsetTop = properties.offsetTop;
	this._offsetLeft = properties.offsetLeft;
	this._tileWidth = properties.tileWidth;
	this._tileHeight = properties.tileHeight;
	this._tileMargin = properties.tileMargin;
	this._paddingBottom = properties.paddingBottom || 0;
	this._setEventListeners();
}

var _p = AssignmentsGUI.prototype;

_p._setEventListeners = function() {
	var self = this;
	this._assignments._addEventListener('changeAssignnment', function(action) {
		var ao = self._activeObjects[action];
		var name = self._assignments.getKeyName(action);
		ao.data('innerText', name);
		self._trigger('dirt-window');
	})
};

_p.getMinHeight = function() {
	var height = 0;
	var bindingsAmount = Object.keys(this._assignments.getList()).length;
	var restorButtonHeight = 50;
	var totalTileHeight = this._tileHeight + this._tileMargin;
	
	height += this._offsetTop;
	height += totalTileHeight * bindingsAmount;
	height += restorButtonHeight;
	height += this._paddingBottom;

	return height;
};

_p.createActiveObjects = function() {
	var self = this;
	var AOManager = this._AOManager;
	var assignments = this._assignments
	var list = assignments.getList();
	var top = this._offsetTop;

	for (var action in list) {
		this._addActionNameBox(action, top);
		this._addClickableBox(action, top);
		top += this._tileHeight + this._tileMargin;
	}
	this._createRestoreButton(top);
};

_p._addActionNameBox = function(action, top) {

	var AOManager = this._AOManager;
	var list = this._assignments.getList();
	var self = this;

	AOManager.add({
		left: this._offsetLeft ,
		top: top,
		width: this._descriptionWidth,
		height: this._tileHeight
	}).data({
		scene: 'Controls',
		textColor: '#F00',
		innerText: action
	})

}

_p._addClickableBox = function(action, top) {
	var AOManager = this._AOManager;
	var assignments = this._assignments;
	var list = this._assignments.getList();
	var self = this;

	var hoverStyle = {
		bgColor: '#cc3',
		cursor: 'pointer'
	};

	var activeStyle = {
		bgColor: '#f90'
	}

	this._activeObjects[action] = AOManager.add({
		left: this._offsetLeft + this._descriptionWidth,
		top: top,
		width: this._tileWidth,
		height: this._tileHeight,
		leftClick: function() {
			AOManager.each(function(ao) {
				ao.removeClass('active');
			})
			this.addClass('active', activeStyle);
			assignments.setActiveBinding(action);
			self._trigger('dirt-window');
		},
		onBlur: function() {
			AOManager.each(function(ao) {
				ao.removeClass('active');
			})
			assignments.setActiveBinding(null);
			self._trigger('dirt-window');
		},
		onHover: function() {
			this.data('hover', hoverStyle);
			self._trigger('dirt-window');
		},
		onMouseOut: function() {
			self._trigger('dirt-window');
		}
	});

	this._activeObjects[action].data({
		scene: 'Controls',
		bgColor: '#AAA',
		innerText: list[action]
	});
};

_p._createRestoreButton = function(top) {
	var assignments = this._assignments;
	this._restoreButtonActiveObject = this._AOManager.add({
		left: this._offsetLeft,
		top: top,
		width: this._tileWidth + this._descriptionWidth,
		height: this._tileHeight,
		leftClick: function() {
			assignments._setDefaultAssignments();
			assignments._saveAssignmentToStorage();
		},
		onHover: function() {
			document.body.style.cursor = 'pointer';
		},
		onMouseOut: function() {
			document.body.style.cursor = 'default';
		}
	});
	this._restoreButtonActiveObject.data({
		scene: 'Controls',
		bgColor: '#55C',
		innerText: 'Restore Default'
	});
}