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
           dest[prop] = o[prop];
        }
    }
}


function loadJSON() {
	var fail = [], 
		args = [].slice.call(arguments),
		success = new Array(args.length),
		onSuccess = null,
		onFail = null,
		counter = args.length;
    
	function count() {
		if (--counter === 0) {
			if (fail.length === 0) {
				onSuccess && onSuccess.apply(this, success);
			}
			else onFail && onFail.apply(this, fail);
		}
	}

	for (var i = 0; i < args.length; i++) {
		var request = new XMLHttpRequest();
		request.open('GET', args[i], true);
		request.send(null);
        request.setRequestHeader("Content-Type", "application/json");
		request.onload = function (connection) {
			if (connection.target.status === 200) {
				// Success
				var data = JSON.parse(connection.target.responseText);
				success[this] = data;
				count();
			} else {
				fail.push(args[this]);
				count();
			}
		}.bind(i); // Do zmiany!
		request.onerror = function (connection) {
			fail.push(args[this]);
			count();
		}.bind(i); // Do zmiany!
	}
	return {
		then: function (callback) {
			onSuccess = callback;
			return this;
		},
		fail: function (callback) {
			onFail = callback;
			return this;
		}
	}
}

Math.sign = Math.sign || function (x) {
    return x === 0 ? 0 : x / Math.abs(x);
}

function relativate(x, y) {
	return {
		x: x - game._player.x - game._player.width / 2 + game._board.width / 2,
		y: y - game._player.y - game._player.width / 2 + game._board.height / 2
	}
} 

function RectCollision(o1, o2) {
    if(o2.x < o1.x + o1.width && o2.y < o1.y + o1.height 
    && o2.x + o2.width > o1.x && o2.y + o2.height > o1.y) {
        return true;
    }
    return false;
}













// Canvas shortcuts
function addAdditionalfunctionsToCtx(ctx) {
    ctx.roundRect = function (x, y, width, height, radius, fill, stroke) {
        if (stroke === undefined) stroke = true;
        if (radius === undefined) radius = 5;

        this.beginPath();
        this.moveTo(x + radius, y);
        this.lineTo(x + width - radius, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.lineTo(x + width, y + height - radius);
        this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.lineTo(x + radius, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
        this.closePath();
        if (stroke) this.stroke();
        if (fill) this.fill();
    };

    ctx.circle = function (x, y, radius, fill, stroke) {
        this.beginPath();
        if (fill) this.fillStyle = fill;
        this.arc(x, y, radius, 0, 2 * Math.PI, false);
        this.fill();
        if (stroke) {
            this.strokeStyle = stroke;
            this.stroke();
        }
        return this;
    };
    
    ctx.style = function(o) {
        extend(ctx, o);
    }
    
    ctx.drawRect = function(x, y, width, height, fill, stroke) {
        if (fill) this.fillStyle = fill;
            this.fillRect(x, y, width, height);
        if(stroke) {
            this.strokeStyle = stroke;
            this.strokeRect(x, y, width, height);
        }
    }

    ctx.handDrawnText = function (txt, x, y, stroke, fill, isCenter, sound) {
        var dashLen = 220,
            dashOffset = dashLen,
            speed = 15,
            lineWidth = this.lineWidth = 3,
            fontSize = 50,
            font = this.font = fontSize + "px Comic Sans MS, cursive, TSCu_Comic, sans-serif",
            alpha = 0.2,
            i = 0,
            callback = function () { },
            self = this;

        self.textAlign = 'left';
        fill = fill || '#000';
        stroke = stroke || 'rgba(0, 0, 0, 0.5)';

        if (isCenter === true) {
            x -= (this.measureText(txt).width + lineWidth * txt.length / 2) / 2;
            console.log(x);
        }
        
        // odgłos pierwszej litery
        sound && txt[i] !== ' ' && sound.cloneNode().play();

        (function loop() {
            self.lineWidth = lineWidth;
            self.textAlign = 'left';
            self.save();
            self.font = font;
            self.lineJoin = "round";
            self.globalAlpha = alpha;
            self.textBaseline = "hanging";
           
            // self.clearRect(x, y, 60, fontSize);
            self.setLineDash([dashLen - dashOffset, dashOffset - speed]);
            dashOffset -= speed;
            self.strokeStyle = stroke;
            self.strokeText(txt[i], x, y);

            if (dashOffset > 0) requestAnimationFrame(loop);
            else {
                
                self.fillStyle = fill;
                self.fillText(txt[i], x, y);
                dashOffset = dashLen;
                x += self.measureText(txt[i++]).width + lineWidth * Math.random();
                self.setTransform(1, 0, 0, 1, 0, 4 * Math.random());
                if (i < txt.length) {
                    sound && txt[i] !== ' ' && sound.cloneNode().play();
                    requestAnimationFrame(loop);
                }
                else callback();
            }
            self.restore();
        })();
        return {
            next: function (fn) {
                callback = fn;
            },
            wait: function (timeout, fn) {
                callback = function() {
                    window.setTimeout(fn, timeout);
                }
            }
        }
    }
}