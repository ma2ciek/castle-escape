// Vector
var Vector = function (dx, dy) {
    this.dx = dx;
    this.dy = dy;

    this.size = Math.sqrt(dx * dx + dy * dy);

    this.unit = {
        x: this.dx / this.size,
        y: this.dy / this.size
    }
}

// FPS Counter module
var fps = (function () {
    var times = [0];
    var timeSum = 0;
    var lastTime = Date.now();

    // Default options
    var options = {
        left: 0,
        top: 0,
        fontSize: 15,
        fontFamily: "Verdana",
        maxLength: 60,
        fillStyle: 'black',
        textBaseline: 'top',
        textAlign: 'left',
    }

    function draw(ctx, _fps) {
        var o = options;
        ctx.textAlign = o.textAlign;
        ctx.textBaseline = o.textBaseline;
        ctx.fillStyle = o.fillStyle;
        ctx.font = o.fontSize + 'px ' + o.fontFamily;
        ctx.fillText('FPS:' + _fps, o.left, o.top);
    }

    return {
        count: function (ctx) {
            var diff = Date.now() - lastTime;
            lastTime = Date.now();

            if (times.length > options.maxLength) timeSum -= times.pop();
            times.unshift(diff);
            timeSum += diff;
            var _fps = 1000 / (timeSum / times.length) | 0;
            draw(ctx, _fps);
        },

        // changing default options
        set: function (o) {
            if (typeof o !== 'object') {
                throw new Error("Wrong data type");
                return;
            }
            for (var i in o) {
                if (options.hasOwnProperty(i)) {
                    if (o[i] !== undefined) {
                        options[i] = o[i];
                    }
                } else {
                    throw new Error("Wrong option name");
                }
            }
        }
    };
})();

function CreateArray(length) {
    var array = new Array(length || 0);
    var i = length;

    if (arguments.length > 1) {
        var args = [].slice.call(arguments, 1);
        while (i--) array[length - 1 - i] = CreateArray.apply(this, args);
    }
    return array;
}


function extend(dest) {
    var objects = Array.prototype.splice.call(arguments, 1);
    for (var i = 0; i < objects.length; i++) {
        var o = objects[i];
        for (var prop in o) {
          //  if (o.hasOwnProperty(prop)) {
                dest[prop] = o[prop];
         //   }
        }
    }
}


function loadJSON (url, onSuccess, onFail) {
	var request = new XMLHttpRequest();
	request.open('GET', url, true);
    request.send(null);
	request.onload = function() {
		if(this.status >= 200 && this.status < 400) {
			// Success
			var data = JSON.parse(this.response);
			onSuccess && onSuccess(data);
		} else {
			onFail && onFail.call(this);
		}
	}
	request.onerror = function() {
		onFail && onFail.call(this);
	}
}

Math.sign = Math.sign || function (x) {
    return x === 0 ? 0 : x / Math.abs(x);
}

function relativate(x, y) {
	return {
		x: x - game._player.x + game._player.width / 2 + game._board.width / 2,
		y: y - game._player.y + game._player.width / 2 + game._board.height / 2
	}
} 

function RectCollision(o1, o2) {
    if(o2.x < o1.x + o1.width && o2.y < o1.y + o1.height 
    && o2.x + o2.width > o1.x && o2.y + o2.height > o1.y) {
        return true;
    }
    return false;
}


function screenToWorld(x, y) {
    
}

function worldToScreen(x, y) {
    
}