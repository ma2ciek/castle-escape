var $ = (function () {
	function DocumentQuery() {

		var elements = [];
		if (typeof arguments[0] === 'object') {
			for (var i = 0; i < arguments.length; i++) {
				var arg = arguments[i];
				if (arg === null || arg === undefined)
					elements = [];

				else if (arg.length)
					for (var j = 0; j < arg.length; j++) {
						elements = elements.concat(arg[j]);
					}
				else
					elements = elements.concat(arg);
			}
		}
		else {
			var query = arguments[0];

			console.log(query);

			var creatingNewSelector = /<*>/;

			if (creatingNewSelector.test(query)) {
				var temp = document.createElement('template');
				temp.innerHTML = query;
				elements = temp.content.children;
			}

			else
				elements = getElementsFromPattern(query, document);
		}

		return new DocumentObjectsManager(elements);
	}

	function getElementsFromPattern(pattern, context) {
		var queryElements = pattern.split(' ');
		var queryEl = queryElements.shift();
		if (!queryEl)
			return [];

		var elements = [];
		var id = getId(queryEl);
		
		if (id) {
			var el = document.getElementById(id);
			el && elements.push(el);
		} else {
			var classes = getClasses(queryEl);
			var tag = getTag(queryEl);
			
			if(classes && tag) {
				var classElements = context.getElementsByClassName(classes);
				var tagElements = context.getElementsByTagName(tag);
				
				tagElements.filter(function(n) {
				    return classElements.indexOf(n) !== -1;
				});
			} else if (classes)
				elements = context.getElementsByClassName(classes);
		  else if (tag)
				elements = context.getElementsByTagName(tag);		
			}
		}
		
		if (queryElements.length === 0)
			return elements;
			
		var matched = [];
		var newPattern = queryElements.join(' ');
		for (var i = 0; i < elements.length; i++) {
			var newElems = getElementsFromPattern(newPattern, elements[i]);
			for (var j = 0; j < newElems.length; j++) {
				matched.push(newElems[j]);
			}
			matched = removeDuplicate(matched);
		}
		return matched;
	}

	function removeDuplicate(array) {
		// TODO: speed up this fn
		return array.filter(function (item, pos) {
			return array.indexOf(item) === pos;
		});
	}

	function getTag(el) {
		var tagPattern = /^[a-z]\w+/;
		var match = el.match(tagPattern);
		if (match)
			return match[0];
	}

	function getId(el) {
		var idPattern = /#[\w-]+/;
		var match = el.match(idPattern)
		if (match) {
			var id = match[0].slice(1);
			return id;
		}
	}

	function getClasses(el) {
		var classPattern = /\.[\w-]+/g;
		var classes = el.match(classPattern);
		if (!classes)
			return;

		for (var j = 0; j < classes.length; j++) {
			classes[j] = classes[j].slice(1);
		}

		if (classes !== null && classes.length > 0) {
			var classesQuery = classes.join(' ');
			return classesQuery;
		}
	}

	return DocumentQuery;
})();



function DocumentObjectsManager(elements) {
	for (var i = 0; i < elements.length; i++) {
		this[i] = elements[i];
	}
	this._elements = elements;
}

var _p = DocumentObjectsManager.prototype;

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

_p.html = function (html) {
	this._each(function (el) {
		el.innerHTML = html;
	});
	return this;
};

_p.append = function (html) {
	var temp = document.createElement('template');
	temp.innerHTML = html;
	this._each(function (el) {
		el.appendChild(temp.content);
	});
	return this;
};

_p.remove = function () {
	this._each(function (el) {
		el.outerHTML = '';
	});
};

_p.eq = function (index) {
	return this._elements[index];
}

_p.attr = function (attrName, value) {
	if (value) {
		this._each(function (el) {
			el.setAttribute(attrName, value);
		});
		return this;
	}
	else
		return this._elements[0].getAttribute(attrName);
}