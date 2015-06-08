function DocumentQuery() {
	var elements = [];
	if(typeof arguments[0] == 'object') {
		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];

			if(arg.length)
				for(var j =0; j<arg.length; j++) {
					elements = elements.concat(arg[j]);
				}
			else
				elements = elements.concat(arg);
		}
		return new DocumentObjectsManager(elements);
	}
	else {
		var element = document.createElement(arguments[0]);
		return new DocumentObjectsManager([element]);
	}
}

var $ = DocumentQuery;

function DocumentObjectsManager(elements) {
	for(var i=0; i<elements.length; i++) {
		this[i] = elements[i];
	}
	this._elements = elements;
}

var _p = DocumentObjectsManager.prototype;

_p.valueOf = function() {
	return this._elements;
}

_p._each = function (fn) {
	for (var i = 0; i < this._elements.length; i++) {
		var el = this._elements[i];
		fn.call(el, el);
	}
}

_p.addClass = function (someClass) {
	this._each(function (el) {
		el.className += el.className ? " " + someClass : someClass;
	});
	return this;
};

_p.removeClass = function (someClass) {
	this._each(function (el) {
		var regexp = new RegExp('\\s*' + someClass + '\\s*', 'g');
		el.className = el.className.replace(regexp, ' ');
	});
	return this;
};

_p.hasClass = function (someClass) {
	var el = this._elements[0];
	var regexp = new RegExp(someClass, 'g');
	return regexp.test(el.className);
};

_p.hide = function (ms, callback) {
	var self = this;
	this._each(function (el) {
		var delta = ms ? 30 / ms : 0.04;
		var opacity = el.style.opacity === "" ? 1 : parseFloat(el.style.opacity);
		el.style.opacity = Math.max(0, opacity - delta);
		if (el.style.opacity > 0) {
			window.setTimeout(self.hide.bind(self, ms, callback), 30);
		}
		else
			callback && callback();
	});
	return this;
};

_p.show = function (el, ms, callback) {
	var self = this;
	this._each(function (el) {
		var delta = ms ? 30 / ms : 0.04;
		var opacity = el.style.opacity === "" ? 1 : parseFloat(el.style.opacity);
		//debugger;
		el.style.opacity = Math.min(1, opacity + delta);
		if (el.style.opacity < 1)
			window.setTimeout(self.show.bind(self, ms, callback), 30);
		else
			callback && callback();
	});
	return this;
};

_p.html = function(html) {
	this._each(function (el) {
		el.innerHTML = html;
	});
	return this;
}

_p.remove = function() {
	this._each(function (el) {
		el.outerHTML = '';
	});
}