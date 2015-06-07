var activeObjects = (function() {
    var list = [];
    var selected = null;
    var hover = null;
    var mousePos = {
        x: 0,
        y: 0
    }

    function watch(canvas) {
        window.addEventListener('mousedown', _mouseClick);
        canvas.addEventListener('mousemove', _mouseMove);
        canvas.addEventListener('mouseleave', _mouseLeave);
    }

    function unwatch() {
        window.removeEventListener('mousedown', _mouseClick);
        canvas.removeEventListener('mousemove', _mouseMove);
        canvas.removeEventListener('mouseleave', _mouseLeave);
    };

    function _mouseClick(e) {
        var c = _getCursorPosition(e);
        var ao = get(c.x, c.y);

        if (e.target.nodeName !== 'CANVAS')
            return;

        if (e.which === 1) {
            var aos = selected;
            if (ao != aos)
                aos && typeof aos.onBlur === 'function' && aos.onBlur();

            ao && typeof ao.leftClick === 'function' && ao.leftClick(e);

            selected = ao;
        } else if (e.which === 3) {
            if (ao && typeof ao.rightClick === 'function') {
                ao.rightClick(e);
            }
            selected = null;
            return false;
        }
    }

    function _mouseMove(e) {
        var c = _getCursorPosition(e);
        if (hover !== get(c.x, c.y)) {
            if (hover && typeof hover.onMouseOut === 'function')
                hover.onMouseOut();
            var ao = hover = get(c.x, c.y);
            if (ao && typeof ao.onHover === 'function')
                ao.onHover(e);

        }
        mousePos = c;

    }

    function _mouseLeave(e) {
        hover = null;
    }

    function _getCursorPosition(e) {
        return {
            x: e.pageX - e.target.offsetLeft,
            y: e.pageY - e.target.offsetTop
        };
    }

    

    function add(o) {
        list.push(new ActiveObject(o))
        return list[list.length - 1];
    }

    // CONSTRUCTOR Active Object
    function ActiveObject(o) {
        this.leftClick = o.leftClick || null;
        this.rightClick = o.rightClick || null;
        this.onHover = o.onHover || null;
        this.onBlur = o.onBlur || null;
        this.onMouseOut = o.onMouseOut || null; // Edited
        this.x = o.left || o.x;
        this.y = o.top || o.y;
        this.width = o.width;
        this.height = o.height;
        this.shape = o.shape || 'rect';
        this.zIndex = o.zIndex || 0;
        this.fromCenter = o.fromCenter || false;
        this._data = [];

        if (!this.fromCenter && this.shape === 'arc') {
            this.x += this.radius;
            this.y += this.radius;
        }
        if (this.fromCenter && this.shape === 'rect') {
            this.x -= this.width / 2;
            this.y -= this.height / 2;
        }
    }
    ActiveObject.prototype.remove = function() {
        list.splice(list.indexOf(this), 1);
    };

    ActiveObject.prototype.data = function() {
        var args = arguments;
        if (args.length == 1)
            return this._data[args[0]];
        this._data[args[0]] = args[1];
    };

    function get(x, y) {
        var z = -Infinity,
            element = null;

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

    function getSelected() {
        return selected;
    }

    function removeAll() {
        list = [];
        hover = null;
    }

    function getAll() {
        return list;
    }

    function filter(fn) {
        var passedElements = [];
        for(var i=0; i<list.length; i++) {
            var ao = list[i];
            var result = fn.call(ao, ao);
            if(result)
                passedElements.push(ao);
        }
        return passedElements;
    }

    return {
        getSelected, add, filter, get: get, getAll, removeAll, watch, unwatch
    };

})();