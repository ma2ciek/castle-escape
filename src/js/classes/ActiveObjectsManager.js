function ActiveObjectsManager(canvas) {
    this._canvas = canvas;
    this._list = [];
    this._selected = null;
    this._hover = null;
    this._mousePos = {
        x: 0,
        y: 0
    }
}

var _p = ActiveObjectsManager.prototype;

_p.add = function(param) {
    var ao = new ActiveObject(this, param)
    this._list.push(ao);
    return ao;
};

_p.get = function(x, y) {
    var z = -Infinity,
        element = null,
        list = this._list

    for (var i = 0; i < list.length; i++) {
        var o = list[i];

        switch (o.shape) {
            case 'rect':
                if (o.x <= x && o.x + o.width >= x && o.y <= y && o.y + o.height >= y) {
                    if (o.zIndex > z) {
                        element = o;
                        z = o.zIndex;
                    }
                }
                break;
            case 'arc':
                // coś tu nie działa
                if ((o.x - x) * (o.x - x) + (o.y - y) * (o.y - y) <= o.radius * o.radius) {
                    if (o.zIndex > z) {
                        element = o;
                        z = o.zIndex;
                    }
                }
                break;
            default:
                throw new TypeError("Wrong shape");
        }
    }
    return element;
}

_p.getSelected = function() {
    return this._selected;
};

_p.getHover = function() {
    return this._hover;
}

_p.getAll = function() {
    return this._list;
};

_p.filter = function(fn) {
    var passedElements = [];
    for (var i = 0; i < this._list.length; i++) {
        var ao = this._list[i];
        var result = fn.call(ao, ao);
        if (result)
            passedElements.push(ao);
    }
    return passedElements;
};

_p.each  = function(fn) {
    for(var i=0; i<this._list.length; i++) {
        var ao = this._list[i];
        fn.call(ao, ao);
    }
};

_p.remove = function(ao) {
    var index = this._list.indexOf(ao);
    this._list.splice(index, 1);
};

_p.removeAll = function() {
    this._list.length = 0;
    this._hover = null;
};

_p.watch = function() {
    var self = this;
    window.addEventListener('mousedown', self._mouseClick.bind(self));
    this._canvas.addEventListener('mousemove', self._mouseMove.bind(self));
    this._canvas.addEventListener('mouseleave', self._mouseLeaveCanvas.bind(self));
};

_p.unwatch = function() {
    var self = this;
    window.removeEventListener('mousedown', self._mouseClick);
    this._canvas.removeEventListener('mousemove', self._mouseMove);
    this._canvas.removeEventListener('mouseleave', self._mouseLeaveCanvas);
};

_p._mouseClick = function(e) {
    var c = this._getCursorPosition(e);
    var ao = this.get(c.x, c.y);

    if (e.target.nodeName !== 'CANVAS')
        return;

    if (e.which === 1) {
        var aos = this._selected;
        if (ao != aos)
            aos && typeof aos.onBlur === 'function' && aos.onBlur();

        ao && typeof ao.leftClick === 'function' && ao.leftClick(e);

        this._selected = ao;
    } else if (e.which === 3) {
        if (ao && typeof ao.rightClick === 'function') {
            ao.rightClick(e);
        }
        this._selected = null;
        return false;
    }
};

_p._mouseMove = function(e) {
    var c = this._getCursorPosition(e);
   
    if (this._hover !== this.get(c.x, c.y)) {
        var previous_AO = this._hover;
        var ao = this._hover = this.get(c.x, c.y);

        if (previous_AO && typeof previous_AO.onMouseOut === 'function')
            previous_AO.onMouseOut();
        
        if (ao && typeof ao.onHover === 'function')
            ao.onHover(e);

    }
    this._mousePos = c;
};

_p._mouseLeaveCanvas = function() {
    this._hover = null;
};

_p._getCursorPosition = function(e) {
    return {
        x: e.pageX - e.target.offsetLeft,
        y: e.pageY - e.target.offsetTop
    };
};

// CONSTRUCTOR Active Object
function ActiveObject(manager, o) {
    this._manager = manager;
    this._data = {};
    this._classes = {};

    this._setDimensions(o);
    this._setEventListeners(o);
    this._setOffset(o);
}

var _p = ActiveObject.prototype;

_p._setDimensions = function(o) {
    this.radius = o.radius;
    this.width = o.width;
    this.height = o.height;
    this.shape = o.shape || 'rect';
    this.zIndex = o.zIndex || 0;
};

_p._setEventListeners = function(o) {
    this.leftClick = o.leftClick || null;
    this.rightClick = o.rightClick || null;
    this.onHover = o.onHover || null;
    this.onBlur = o.onBlur || null;
    this.onMouseOut = o.onMouseOut || null;
};

_p._setOffset = function(o) {
    this.x = o.left || o.x || 0;
    this.y = o.top || o.y || 0;
    this.fromCenter = o.fromCenter || false;

    if (!this.fromCenter && this.shape === 'arc') {
        this.x += this.radius;
        this.y += this.radius;
    }
    if (this.fromCenter && this.shape === 'rect') {
        this.x -= this.width / 2;
        this.y -= this.height / 2;
    }
};

_p.centerX = function() {
    return this.x + this.width / 2;
};
_p.centerY = function() {
    return this.y + this.height / 2;
};

_p.remove = function() {
    this._manager.remove(this);
};

_p.data = function() {
    var args = arguments;
    switch (args.length) {
        case 0:
            return this._data;
        case 1:
            if (typeof args[0] === 'object') {
                for (var propertyName in args[0]) {
                    var propertyValue = args[0][propertyName];
                    this._data[propertyName] = propertyValue;
                }
            } else {
                return this._data[args[0]];
            }
            break;
        case 2:
            this._data[args[0]] = args[1];
            break;
        default:
            throw new Error('Too many arguments');
    }
};

_p.addClass = function(className, o) {
    this._classes[className] = o;
};

_p.removeClass = function(className) {
    delete this._classes[className];
};

_p.getClasses = function() {
    return this._classes;
};