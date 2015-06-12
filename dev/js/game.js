
//#### src/js/main.js
/* global console */

document.addEventListener('init', function() {
	init();
});

var canvas,
	ctx,
	user,
	audioManager,
	settings,
	game,
	activeObjects,
	AORenderer;

function init() {
	canvas = document.getElementsByTagName('CANVAS')[0];
	ctx = canvas.getContext('2d');
	addAdditionalfunctionsToCtx(ctx);
	activeObjects = new ActiveObjectsManager(canvas);
	activeObjects.watch();
	AORenderer = new ActiveObjectsRenderer(ctx, activeObjects);
	settings = new Settings();
	audioManager = new AudioManager();
	user = new User();
	game = new Game();
}

//#### src/js/lib/ctxAdditionalMethods.js
function addAdditionalfunctionsToCtx(ctx) {
    ctx.roundRect = function (x, y, width, height, radius, fill, stroke) {
        if (stroke === undefined) 
            stroke = true;
        if (!radius) 
            radius = 5;

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
    };
    
    ctx.drawRect = function(x, y, width, height, fill, stroke) {
        if (fill) this.fillStyle = fill;
            this.fillRect(x, y, width, height);
        if(stroke) {
            this.strokeStyle = stroke;
            this.strokeRect(x, y, width, height);
        }
    };

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

        function getDefault(self) {
            self.lineWidth = lineWidth;
            self.textAlign = 'left';
            self.save();
            self.font = font;
            self.lineJoin = "round";
            self.globalAlpha = alpha;
            self.textBaseline = "hanging";
            self.setLineDash([dashLen - dashOffset, dashOffset - speed]);           
            self.strokeStyle = stroke;
        }


        (function loop() {
            getDefault(self);
            dashOffset -= speed;
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
                };
            }
        };
    };
}

//#### src/js/lib/lib.js
// FPS Counter module
var fps = (function () {
   var times = [0];
   var timeSum = 0;
   var lastTime = Date.now();
   var options = {
      left: 0,
      top: 0,
      fontSize: 15,
      fontFamily: "Verdana",
      maxLength: 60,
      fillStyle: 'black',
      textBaseline: 'top',
      textAlign: 'left',
   };

   function setOptions(o) {
      if (typeof o !== 'object') {
         throw new Error("Wrong data type");
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

   function getFPS() {
      return 1000 / (timeSum / times.length) | 0;
   }

   function count(ctx) {
      nextStage();
      draw(ctx, getFPS());
   }

   function nextStage() {
      var diff = Date.now() - lastTime;
      lastTime = Date.now();
      if (times.length > options.maxLength) timeSum -= times.pop();
      times.unshift(diff);
      timeSum += diff;
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
      get: getFPS,
      set: setOptions,
      count: count,
   };
})();

function createArray(length) {
   var array = new Array(length || 0);
   var i = length;

   if (arguments.length > 1) {
      var args = [].slice.call(arguments, 1);
      while (i--) array[length - 1 - i] = createArray.apply(this, args);
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
   return dest;
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
         } else onFail && onFail.apply(this, fail);
      }
   }

   function getData(request, i) {
      if (request.status === 200) {
         // Success
         var data = request.response;
         success[i] = data;
         count();
      } else
         getError(i);
   }

   function getError(i) {
      fail.push(args[i]);
      count();
   }

   for (var i = 0; i < args.length; i++) {
      makeRequest(i);
   }

   function makeRequest(i) {
      var request = new XMLHttpRequest();
      request.open('GET', args[i], true);
      request.send(null);
      request.responseType = 'json';
      request.onload = function () {
         getData(this, i);
      };
      request.onerror = function () {
         getError(i);
      };
   }

   function successCallback(callback) {
      onSuccess = callback;
      return this;
   }

   function failCallback(callback) {
      onFail = callback;
      return this;
   }

   return {
      then: successCallback,
      fail: failCallback
   };
}

/*
function RectCollision(o1, o2) {
    if (o2.x < o1.x + o1.width && o2.y < o1.y + o1.height && o2.x + o2.width > o1.x && o2.y + o2.height > o1.y) {
        return true;
    }
    return false;
}
*/

//#### src/js/lib/polyfill.js
// JS Objects change

Date.now = Date.now || function () {
    return +new Date();
};

Math.sign = Math.sign || function (x) {
    return x === 0 ? 0 : x / Math.abs(x);
};

Array.prototype.indexOf = Array.prototype.indexOf || function (x) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === x)
            return i;
    }
    return -1;
};

Array.prototype.includes = Array.prototype.includes || function (x) {
    return this.indexOf(x) !== -1;
};


//#### src/js/classes/ActiveObjectsManager.js
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

//#### src/js/classes/ActiveObjectsRenderer.js
function ActiveObjectsRenderer(ctx, manager) {
	this._ctx = ctx;
	this._AOManager = manager;
}

var _p = ActiveObjectsRenderer.prototype;

_p.renderAll = function() {
	var elements = this._AOManager.getAll();
	for (var i = 0; i < elements.length; i++) {
		var ao = elements[i];
		this.renderActiveObject(ao);
	}
};

_p.renderActiveObject = function(ao) {
	var isHover = this._isHover(ao);
	var classes = ao.getClasses();
	var aoStyle = extend({}, this._defaultStyle, ao.data());

	isHover && extend(aoStyle, ao.data('hover'));

	for(var className in classes) {
		var currentClass = classes[className];
		extend(aoStyle, currentClass);
	}

	
	aoStyle.bgColor && this._drawBackground(ao, aoStyle);
	aoStyle.innerText && this._drawText(ao, aoStyle);
};

_p._isHover = function(ao) {
	return ao === this._AOManager.getHover() &&
		typeof ao.data('hover') != 'undefined';
};

_p._drawBackground = function(ao, aoStyle) {
	this._ctx.fillStyle = aoStyle.bgColor;
	this._ctx.fillRect(ao.x, ao.y, ao.width, ao.height);
};

_p._drawText = function(ao, aoStyle) {
	var text = aoStyle.innerText;

	this._ctx.textBaseline = aoStyle.textBaseline;
	this._ctx.font = aoStyle.textFont;
	this._ctx.fillStyle = aoStyle.textColor;
	this._ctx.textAlign = aoStyle.textAlign;

	var textOffsetLeft;

	switch(aoStyle.textAlign) {
		case 'left':
			textOffsetLeft = ao.x;
			break;
		case 'center':
			textOffsetLeft = ao.x + ao.width / 2;
			break;
		case 'right':
			textOffsetLeft = ao.x + ao.width;
			break;
		default:
			throw new Error('No such option')

	}

	var textHeight = this._ctx.measureText('M').width;
	var textOffsetTop = ao.y + (ao.height - textHeight) / 2;

	this._ctx.fillText(text, textOffsetLeft, textOffsetTop);
};

_p._defaultStyle = {
	textBaseline: 'hanging',
	textColor: '#000',
	textFont: '15px Arial',
	textAlign: 'center'
};

_p.renderScene = function(scene) {
	var elements = this._AOManager.filter(function() {
		return this.data('scene') === scene;
	});

	for(var i=0; i<elements.length; i++) {
		var ao = elements[i];
		console.log(ao);
		this.renderActiveObject(ao);
	}
}

//#### src/js/classes/Animation.js
function Animation(options) {
	extend(this, new EventEmitter());
	options = options || {};
	this._size = options.size;
	this._createFrames(options);
	this._timeStamp = 0;
	this._frameIndex = options.startIndex || 0;
	this._frameLooped = options.frameLooped || false;
	this._frameDuration = options.frameDuration || 3;
	this._priorytet = options.priorytet || 0;
	this._audioLooped = options.audioLooped || false;
}

var _p = Animation.prototype;

_p.setAudio = function(audio) {
	this._audio = audio.cloneNode();
	this._audio.addEventListener('ended', this._onAudioEnded);
};

_p._onAudioEnded = function () {
	if (this._audioLooped)
		this._audio.play();
	this._trigger('audioEnded');
};

_p._createFrames = function (options) {

	var offsetLeft = options.offsetLeft || 0;
	var offsetTop = options.offsetTop || 0;
	var i;

	this.frames = [];
	// row direction is default
	if (options.frameDirection === 'column') {
		for (i = 0; i < options.size; i++) {
			this.frames[i] = {
				width: options.frameWidth,
				height: options.frameHeight,
				image: options.image,
				x: offsetLeft,
				y: options.frameHeight * i + offsetTop
			}
		}
	} else {
		for (i = 0; i < options.size; i++) {
			this.frames[i] = {
				width: options.frameWidth,
				height: options.frameHeight,
				image: options.image,
				x: options.frameWidth * i + offsetLeft,
				y: offsetTop
			}
		}
	}
};


_p.setFrameIndex = function (index) {
	this._frameIndex = index;
}

_p.getPrirytet = function() {
	return this._priorytet;
}

_p.nextFrame = function () {
	if (this._timeStamp + this._frameDuration < game.getFrameIndex()) {
		this._timeStamp = game.getFrameIndex();
		
		if (this._frameIndex < this._size - 1)
			this._frameIndex++;

		else {
			if (this._frameLooped)
				this._frameIndex = 0;
			else {
				this._end = 1;
				this._trigger('animationEnd')
			}
		}
	}
}

_p.getCurrentFrame = function () {
	var frame = this.frames[this._frameIndex];
	return {
		image: frame.image,
		x: frame.x,
		y: frame.y,
		width: frame.width,
		height: frame.height
	}
}

//#### src/js/classes/Assignments.js
function Assignments() {
	extend(this, new EventEmitter());
	this._list = {};
	this._keys = {};
	this._activeBinding = null;
	this._setKeyNames();
	this._setDefaultAssignments();
	this._loadAssignmentsFromStorage();
}

Assignments.prototype.getList = function() {
	return this._list;
};

Assignments.prototype.getCodeFromAction = function(action) {
	var keyName = this._list[action];
	for (var keyCode in this._keys) {
		if (this._keys[keyCode] === keyName)
			return keyCode;
	}
}

Assignments.prototype.getActionFromCode = function(code) {
	var keyName = this._keys[code];
	for(var action in this._list) {
		if(this._list[action] == keyName) {
			return action;
		}
	}
}

Assignments.prototype.getKeyName = function(action) {
	return this._list[action];
};

Assignments.prototype.setActiveBinding = function(action) {
	this._activeBinding = action;
};

Assignments.prototype._setKeyNames = function() {
	var keys = {
		8: 'Backspace',
		9: 'Tab',
		13: 'Enter',
		16: 'Shift',
		17: 'Ctrl',
		18: 'Alt',
		19: 'Pause/Break',
		20: 'Caps lock',
		27: 'Escape',
		32: 'Space',
		33: 'Page up',
		34: 'Page down',
		35: 'End',
		36: 'Home',
		37: 'Left arrow',
		38: 'Up arrow',
		39: 'Right arrow',
		40: 'Down arrow',
		45: 'Insert',
		46: 'Delete',
		91: 'Left window key',
		92: 'Right window key',
		93: 'Select key',
		144: 'Num lock',
		145: 'Scroll lock',
		186: 'Semicolon',
		187: 'Equal sign',
		188: 'Comma',
		189: 'Dash',
		190: 'Period',
		191: 'Forward slash',
		192: 'Grave accent',
		219: 'Open bracket',
		220: 'Back slash',
		221: 'Close bracket',
		222: "Quote",
		255: 'Fn'
	};
	var i;

	for (i = 48; i <= 57; i++) { // Numbers
		keys[i] = String.fromCharCode(i);
	}

	for (i = 65; i <= 90; i++) { // Characters
		keys[i] = String.fromCharCode(i);
	}

	for (i = 96; i <= 105; i++) { // Numbers on numpad
		keys[i] = 'Numpad ' + (i - 96);
	}

	for (i = 112; i <= 123; i++) { // Special functions
		keys[i] = 'F' + (i - 111);
	}

	this._keys = keys;
};

Assignments.prototype._loadAssignmentsFromStorage = function() {
	var data = window.localStorage.getItem('Castle_Ecape_Bindings') || '{}';
	var bindings = JSON.parse(data);
	for (var action in bindings) {
		this._list[action] = bindings[action];
	}
};

Assignments.prototype.tryBind = function(keyCode) {
	var key = this._keys[keyCode];
	for (var action in this._list) {
		if (action === this._activeBinding) {
			this._list[action] = key || '';
			this._removeAssignmentNotFrom(key, action);
			this._saveAssignmentToStorage();
			this._trigger('changeAssignnment', action)
			return true;
		}
	}
};

Assignments.prototype._removeAssignmentNotFrom = function(key, currentCheckingAction) {
	for (var action in this._list) {
		if (this._list[action] === key && currentCheckingAction != action) {
			this._list[action] = '';
			this._trigger('changeAssignnment', action)
			break;
		}
	}
};

Assignments.prototype._saveAssignmentToStorage = function() {
	var data = JSON.stringify(this._list);
	window.localStorage.setItem('Castle_Ecape_Bindings', data);
};

Assignments.prototype._setDefaultAssignments = function() {
	var defaultAssignments = {
		'Move Left': 'Left arrow',
		'Move Right': 'Right arrow',
		'Climb Up': 'Up arrow',
		'Climb Down': 'Down arrow',
		'Jump': 'Space',
		'Attack': 'Alt',
		'Inventory': 'I',
		'Settings': 'Escape'
	};

	for (var action in defaultAssignments) {
		this._list[action] = defaultAssignments[action];
		this._trigger('changeAssignnment', action);
	}
};

//#### src/js/classes/AudioManager.js
function AudioManager() {
	extend(this, new EventEmitter());
	this._list = {};
	this._waiting = 0;
	this._loadSettings();
	this._setSettingsChangeListener();
}
var _p = AudioManager.prototype;

_p.add = function (audioList) {
	var length  = Object.keys(audioList).length;
	this._waiting += length;

	for (var name in audioList) {
		var audio = audioList[name];
		var HTMLAudio = new Audio();
		
		// TODO: Without changing DOM model
		HTMLAudio.name = name;
		HTMLAudio.src = audio.src;
		HTMLAudio.localVolume = audio.volume ? audio.volume / 100 : 1;
		HTMLAudio.volume = this._globalVolume * HTMLAudio.localVolume;

		if (audio.loop && !audio.once) {
			HTMLAudio.addEventListener('ended', function() {
				console.log(this);
				this.play();
			});
		}
		
		var cpt = this._canplaythrough.bind(this, HTMLAudio, audio, name);
		HTMLAudio.addEventListener('canplaythrough', cpt);
		HTMLAudio.onerror = this._onerror;

	}
	return this;
};



_p._loadSettings = function() {
	var settingsAssignments = {
		'AUDIO_VOLUME': '_globalVolume',
	}
	for(var optionName in settingsAssignments) {
		var prop = settingsAssignments[optionName];
		var value =  settings.getPropValue(optionName);
		this[prop] = value;
	}
}

_p._setSettingsChangeListener = function() {
	
	var actionAssignments = {
		'AUDIO_VOLUME': '_changeGlobalVolume',
	};
	
	settings._addEventListener('change', function(optionName, value) {
		var method = actionAssignments[optionName];
		
		this[method].call(this, value);
	}.bind(this));
}

_p._canplaythrough = function (HTMLAudio, audio, name) {
	this._list[name] = HTMLAudio;
	this._loaded();
};

_p._onerror = function(audio) {
	console.error('Cannot load this file: ' + audio.src);
	this._loaded();
}

_p.get = function(audioName) {
	if(audioName in this._list)
		return this._list[audioName];
	else
		console.error('Missing audio file: ' + audioName);
};

_p._loaded = function() {
	console.log(this._waiting);
	this._waiting--;
	if(this._waiting === 0)
		this._trigger('audioLoaded');
};

_p._changeGlobalVolume = function (volume) {
	this._globalVolume = volume;
	for (var a in this._list) {
		this._list[a].volume = this._list[a].localVolume * volume;
	}
};

function BgAudio() {
	this._bgAudio = null;
}

BgAudio.prototype._setBgAudio = function(audioName) {

	if(this._bgAudio) {
		if(this._bgAudio.name === audioName)
			return;
		this._bgAudio.pause();
	} 
	try {
		this._bgAudio = audioManager.get(audioName);
		this._bgAudio.currentTime = 0;
		this._bgAudio.play();
	} catch(err) {
		console.error(err);
	}
}

//#### src/js/classes/Board.js
function Board() {
	this._scenes = [];
	extend(this, new EventEmitter());
	this.imgManager = new ImageManager();
	this.width = window.innerWidth;
	this.height = window.innerHeight;
	this.resize();

	var self = this;

	this.imgManager.add({
		'castle-in-clouds': './img/castle-in-clouds.png'
	})._addEventListener('loaded', function() {
		self.redrawScenes();
	});
}

Board.prototype.resize = function() {
	var self = this;

	function resize() {

		self.width = canvas.width = document.documentElement.clientWidth || document.body.clientWidth;
		self.height = canvas.height = document.documentElement.clientHeight || document.body.clientHeight;
		self.redrawScenes();
	}
	window.addEventListener('resize', resize);
	resize();
};

Board.prototype.clear = function() {
	ctx.fillStyle = '#000';
	ctx.fillRect(0, 0, this.width, this.height);
};

Board.prototype.drawScenes = function() {
	for (var i = 0; i < this._scenes.length; i++) {
		this._scenes[i].draw();
	}
};

Board.prototype.redrawScenes = function() {
	ctx.clearRect(0, 0, this.width, this.height);
	this.drawScenes();
}

Board.prototype._addScene = function(scene) {
	var self = this;
	this._scenes.push(scene);
	this._scenes.sort(function(s1, s2) {
		return s1.zIndex - s2.zIndex;
	});
	scene._addEventListener('dirt', self.redrawScenes.bind(self));
	this.redrawScenes();
};

Board.prototype._removeScene = function(scene) {
	scene.remove();
	this._scenes.splice(this._scenes.indexOf(scene));
	this.redrawScenes();
};

Board.prototype.removeScenes = function() {
	for (var i = 0; i < this._scenes.length; i++) {
		this._scenes[i].remove();
	}
	this._scenes.length = 0;
}

Board.prototype.createWelcomeScene = function() {
	this._addScene(new Scene(this, {
		objects: {
			castleImage: {},
			title: {},
			sky: {},
			ground: {},
			HOME_author: {},
			play: {
				onClick: function() {
					location.hash = 'play';
				}
			},
			resume: {
				onClick: function() {
					location.hash = 'continue';
				}
			},
			credits: {
				onClick: function() {
					location.hash = 'credits';
				},
			},
			settings: {
				onClick: function() {
					location.hash = 'settings';
				}
			}
		}
	}));
};


Board.prototype.createSettingsScene = function() {
	var self = this;

	var xhr = new XMLHttpRequest();
	xhr.onload = function() {
		var html = this.response;
		self.settingsGUI = new SettingsGUI(html);
	};
	xhr.open("GET", 'html/settings/index.html');
	xhr.send();
	
	var xhr2 = new XMLHttpRequest();	
	xhr2.onload = function() {
		var style = document.createElement('style');
		style.innerHTML = this.response;
		style.id = 'settings-style';
		document.head.appendChild(style);
	};
	xhr2.open('GET', './html/settings/style.css');
	xhr2.send();
};

Board.prototype.createCreditsScene = function() {
	this._addScene(new Scene(this, {
		bgColor: '#000',
		zIndex: 6,
		objects: {
			bg: {
				onClick: function() {
					location.hash = '';
				}
			},
			author: {
				onClick: function() {
					location.href = 'http://www.google.com'
				}
			},
			graphics: {

			}
		}
	}));
};

//#### src/js/classes/DocumentQuery.js
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

			// console.log(query);

			var creatingNewSelector = /<*>/;

			if (creatingNewSelector.test(query)) {
				var temp = document.createElement('template');
				temp.innerHTML = query;
				elements = temp.content.children;
			}

			else
				elements = getElementsFromPattern(document, query);
		}

		return new DocumentObjectsManager(elements);
	}

	function getElementsFromPattern(context, pattern) {
		var queryElements = pattern.split(' ');
		var queryEl = queryElements.shift();
		if (!queryEl)
			return [];

		var elements = getElementsByClassesTagsAndIds(context, queryEl);
		
		if (queryElements.length === 0)
			return elements;
		
		var newPattern = queryElements.join(' ');
		return getMatchedChildren(newPattern, elements);
	}
	
	function getMatchedChildren(pattern, elements) {
		var matched = [];
		
		for (var i = 0; i < elements.length; i++) {
			var newElems = getElementsFromPattern(elements[i], pattern);
			for (var j = 0; j < newElems.length; j++) {
				matched.push(newElems[j]);
			}
			matched = removeDuplicate(matched);
		}
		return matched;
	}

	function getElementsByClassesTagsAndIds(context, queryEl) {
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
		return elements;
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

//#### src/js/classes/EventEmitter.js
function EventEmitter() {
	this._events = {};
}

EventEmitter.prototype._addEventListener = function (eventType, eventHandler) {
	if (!this._events[eventType])
		this._events[eventType] = [];
	if (typeof eventHandler !== 'function')
		console.error('eventHandler must be a function');
	this._events[eventType].push(eventHandler.bind(this));
};

EventEmitter.prototype._trigger = function (eventType) {
	var events = this._events[eventType]
	if (!events)
		return;
	var args = Array.prototype.slice.call(arguments, 1);
	for (var i = 0; i < events.length; i++) {
		events[i].apply(this, args);
	}
	// this._events[eventType].length = 0;
};

EventEmitter.prototype._removeEventListener = function (eventType, eventHandler) {
	if (typeof this._events[eventType] === 'undefined')
		return;

	var index = this._events[eventType].indexOf(eventHandler);
	console.log(eventHandler, this._events);
	if (index === -1)
		return;

	return this;
};

EventEmitter.prototype._dispatch = function (eventType) {
	if (eventType in this._events)
		this._events[eventType].length = 0;
};

EventEmitter.prototype._getEventListeners = function (eventType) {
	return this._events[eventType];
}



function Timeline() {
	this._timeEvents = {};
	this._frame = 0;
}
Timeline.prototype.getCurrentFrameIndex = function () {
	return this._frame;
}
Timeline.prototype.addEvent = function (_frame, eventCallback, self) {
	_frame += this._frame;
	if (!this._timeEvents[_frame]) this._timeEvents[_frame] = [];
	this._timeEvents[_frame].push(eventCallback.bind(self));
};
Timeline.prototype.showEvents = function () {
	return this._timeEvents;
}
Timeline.prototype.check = function () {
	var events = this._timeEvents[this._frame]; // frame events
	if (events) {
		for (var i = 0; i < events.length; i++) {
			events[i].call(this);
		}
		delete this._timeEvents[this._frame];
	}
};
Timeline.prototype.getFrameIndex = function () {
	return this._frame;
}

//#### src/js/classes/Game.js
function Game() {
	BgAudio.call(this);
	extend(this, new EventEmitter());
	this._board = new Board();
	this._loadAudio();
}

extend(Game.prototype, BgAudio.prototype);

Game.prototype._loadAudio = function() {
	var self = this;
	loadJSON('data/audio.json').then(function(music) {
		// audio
		audioManager.add(music);
		audioManager._addEventListener('audioLoaded', self.onAudioLoaded.bind(self));
	});
};

Game.prototype.onAudioLoaded = function() {
	console.log(audioManager._list);
	this._setNavigation();
}

Game.prototype.play = function() {
	extend(this, new Timeline());
	this._pause = false;
	this._world = new World(this);
	var self = this;
	self._setBgAudio('game-music');
	this._world._addEventListener('loaded', function() {
		self._player = new Player(this);
		self._nextFrame();
	});
}

Game.prototype.pause = function() {
	this._pause = true;
	this._bgAudio && this._bgAudio.pause();
}

Game.prototype.resume = function() {
	this._pause = false;
	this._nextFrame();
	this._bgAudio && this._bgAudio.play();
}


Game.prototype._nextFrame = function() {
	/* global performance */
	try {
		var t1 = performance.now();
		this._frame++;

		this.check();

		this._world._turbulenceManager.setRandomValues();

		this._player.move();
		
		this._board.clear();
		
		
		
		this._world.drawLayers();
		
		
		
		this._world.drawObjects();

		this._board.drawScenes();
		var t2 = performance.now();
		$('#performance').html(t2-t1 | 0);
		//fps.count(ctx);
		//$('#performance2').html(t2-t1 | 0);

		if (!this._pause)
			window.requestAnimationFrame(this._nextFrame.bind(this));

	} catch (err) {
		console.log(err);
	}
};

Game.prototype.goToStartPage = function() {
	this._setBgAudio('start-music');
	this._board.createWelcomeScene();
}

Game.prototype.goToCreditsPage = function() {
	this._setBgAudio('start-music');
	this._board.createCreditsScene();
}

Game.prototype.goToSettingsPage = function() {
	this._setBgAudio('start-music');
	this._board.createSettingsScene();
}

Game.prototype._setNavigation = function() {
	var self = this;

	function hashChange(e) {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
		self._pause = true;
		self._board.removeScenes();

		activeObjects.removeAll();
		
		// removeSettings();

		var hash = location.hash.length === 0 ? '' : location.hash.slice(1);
		switch (hash) {
			case 'play':
				self.play();
				break;
			case '':
				self.goToStartPage();
				break;
			case 'credits':
				self.goToCreditsPage();
				break;
			case 'resume': 
				break;
			case 'settings':
				self.goToSettingsPage();
				break;
			default:
				console.error(hash);
				break;
		}
	}
	window.addEventListener('hashchange', hashChange);
	hashChange(); // trigger;
}

//#### src/js/classes/GameObject.js
function GameObject(_world, properties) {
	extend(this, new EventEmitter());
	switch (properties.name) {
		default:
			break;
	}
	extend(this, properties);
}

GameObject.prototype.draw = function() {
	var animation = this.animations[this.currentAnimationName];
	
	// Do poprawy
	var relPos = game._world.relativate(this.x, this.y);
	
	var frame = animation.getCurrentFrame();
	
	ctx.drawImage(frame.image, 
		frame.x, frame.y, frame.width, frame.height, 
		relPos.x, relPos.y, frame.width, frame.height);
}

//#### src/js/classes/ImageManager.js
function ImageManager() {
	extend(this, new EventEmitter());
	this._counter = 0;
	this._list = {};
}

var _p = ImageManager.prototype;

_p.add = function(o) {

	for(var imgName in o) {
		this._counter++;

		var img = this._list[imgName] = new Image();
		img.src = o[imgName];
		img.onload = this._onload.bind(this, imgName, img.src);
		img.onerror = this._onerror.bind(this, imgName, img.src);
	}
	return this;
}

_p._onload = function() {
	this._count();
}

_p._onerror = function(imgName, imgSrc) {
	this._trigger('error');
	console.error(imgName, imgSrc);
	this._count();
}

_p._count = function() {
	this._counter--;
	if(this._counter === 0)
		this._trigger('loaded');
}

_p.get = function(imgName) {
	return this._list[imgName];
}

//#### src/js/classes/Player.js
function Player(world) {
	var self = this;
	this._world = world;
	this.x = 1265;
	this.y = 2140;
	this.Vy = 0;
	this.width = 48;
	this.height = 92;
	this.speed = 7;
	this.shadowRelativePosition = {
		get x() { return self.x + 23 },
		get y() { return self.y + 15 },
		get width() { return 20 },
		get height() { return 67 },
	};
	this.jumpHeight = 20;
	this.isOnLadder = false;

	// this.audio = audioManager['road'];
	extend(this, new EventEmitter());
	
	// Get prototype functions of GameObject
	extend(this, GameObject.prototype);

	this._setAnimation();
}
var _p = Player.prototype;

_p._setAnimation = function() {

	this.frameSets = [
		"moveDown",
		"moveDownLeft",
		"moveLeft",
		"moveUpLeft",
		"moveUp",
		"moveUpRight",
		"moveRight",
		"moveDownRight"
	];

	var self = this;
	var frameDuration = 3;
	var frameWidth = 48;
	var frameHeight = 92;
	var size = 9;

	this.animations = {};
	this.currentAnimationName = this.frameSets[0];
	this.ready = false;
	this.image = new Image();
	this.image.src = "img/walk-cycle.png";

	this.image.addEventListener('load', function () {
		self.frameSets.forEach(function (animationName, index) {
			self.animations[animationName] = new Animation({
				image: self.image,
				frameWidth: frameWidth,
				frameHeight: frameHeight,
				size: size,
				frameLooped: true,
				offsetTop: frameHeight * index,
				frameDuration: frameDuration
			})
		});
		self.ready = true;
		self._world.addObject(self);
	});
}

_p.animate = function (animationName) {
	if (this.ready) {
		if (this.currentAnimationName === animationName)
			this.animations[animationName].nextFrame();
		else {
			this.currentAnimationName = animationName;
			this.animations[animationName].nextFrame();
		}
	}
}

_p.move = function () {
	var dirX = 0;
	var dirY = 0;

	if (user.actions['Climb Up']) dirY--;
	if (user.actions['Climb Down']) dirY++;
	if (user.actions['Move Left']) dirX--;
	if (user.actions['Move Right']) dirX++;

	var tryingJump = (user.actions.Jump) ? true : false;

	var ladderId = 3;

	var tiles = this.getTilesFromCollisionWithLayer(0);

	if(this.isOnLadder && tiles.indexOf(ladderId) !== -1 && tryingJump)
		this._jumpFromLadder();

	else if ((dirY !== 0 || this.isOnLadder) && tiles.indexOf(ladderId) !== -1)
		this._moveOnLdder(dirY, ladderId);

	else 
		this._moveOnGroundOrTryFall(tryingJump);

	if (dirX !== 0) 
		this._moveAside(dirX);
};

_p._moveOnGroundOrTryFall = function(tryingJump) {
	this.isOnLadder = false;
	this.Vy++;
	this.y += this.Vy;

	var col = this.isInCollisionWithLayer(1);
	if (col) {
		while (this.isInCollisionWithLayer(1))
			this.y -= Math.sign(this.Vy);
		this.Vy = 0;

		tryingJump && this._jumpFromGround();
	}
}

_p._jumpFromLadder = function() {
	this.isOnLadder = false;
	this.Vy = -this.jumpHeight;
	this.y += this.Vy;
	if (this.isInCollisionWithLayer(1)) {
		while (this.isInCollisionWithLayer(1))
			this.y -= Math.sign(this.Vy);
		this.Vy = 0;
	}
};

_p._jumpFromGround = function() {
	this.Vy -= this.jumpHeight;
	this.y += this.Vy;
	if (this.isInCollisionWithLayer(1)) {
		while (this.isInCollisionWithLayer(1))
			this.y -= Math.sign(this.Vy);
		this.Vy = 0;
	}
};

_p._moveAside = function(dirX) {
	this.x += this.speed * dirX;
	if (this.isInCollisionWithLayer(1))
		while (this.isInCollisionWithLayer(1))
			this.x -= dirX;
	else if (dirX === 1)
		this.animate('moveRight')
	else if (dirX === -1)
		this.animate('moveLeft')
};

_p._moveOnLdder = function(dirY, ladderId) {
	this.isOnLadder = true;
	this.Vy = 0;
	this.y += this.speed * dirY;
	if (this.isInCollisionWithLayer(1) || (!this.getTilesFromCollisionWithLayer(0).includes(ladderId) && dirY === -1)) {
		while (this.isInCollisionWithLayer(1) || !this.getTilesFromCollisionWithLayer(0).includes(ladderId))
			this.y -= dirY;
	} else if (dirY !== 0)
		this.animate('moveUp');
};

_p.isInCollisionWithLayer = function (layerIndex) {
	var shadow = this.shadowRelativePosition;
	var layer = this._world._layers[layerIndex].data;
	var y1 = shadow.y / this._world.outputTileHeight | 0;
	var y2 = (shadow.y + shadow.height) / this._world.outputTileHeight | 0;
	var x1 = (shadow.x - shadow.width / 2) / this._world.outputTileWidth | 0;
	var x2 = (shadow.x + shadow.width / 2) / this._world.outputTileWidth | 0;

	for (var i = x1; i <= x2; i++) {
		for (var j = y1; j <= y2; j++) {
			var index = j * this._world.width + i;
			if (layer[index] !== 0)
				return true;
		}
	}
	return false;
};

_p.getTilesFromCollisionWithLayer = function (layerIndex) {
	var shadow = this.shadowRelativePosition;
	var layer = this._world._layers[layerIndex].data;
	var y1 = shadow.y / this._world.outputTileHeight | 0;
	var y2 = (shadow.y + shadow.height) / this._world.outputTileHeight | 0;
	var x1 = (shadow.x - shadow.width / 2) / this._world.outputTileWidth | 0;
	var x2 = (shadow.x + shadow.width / 2) / this._world.outputTileWidth | 0;

	var array = [];
	for (var i = x1; i <= x2; i++) {
		for (var j = y1; j <= y2; j++) {
			var index = j * this._world.width + i;
			array.push(layer[index]);
		}
	}
	return array;
};

//#### src/js/classes/Scene.js
function Scene(board, o) {
	extend(this, new EventEmitter());
	this._board = board;

	this._isVivible = !!o.isVivible;
	this._zIndex = o.zIndex || 0;

	this._setDimensions(board, o);
	this._setOffset(board, o);

	this._bgColor = o.bgColor || null;
	if (o.bgImage)
		this._bgImage = board.imgManager[o.bgImage];

	this._objects = {};
	this._sortedObjects = [];

	for (var objName in o.objects) {
		this._objects[objName] = new SceneObject(this, objName, o.objects[objName]);
	}
	this._sortObjects();
}

Scene.prototype._setDimensions = function (board, o) {
	this._height = o.height || board.height;
	this._width = o.width || board.width;
};

Scene.prototype._setOffset = function (board, o) {
	this._left = o.left || board.width - o.right || 0;
	this._top = o.top || board.width - o.bottom || 0;

	if (o.alignCenter)
		this._left = (board.width - this._width) / 2;
	if (o.alignVertical)
		this._top = (board.height - this._height) / 2;
};

Scene.prototype.getBoard = function () {
	return this._board;
};

Scene.prototype.addObject = function (objName, o) {
	this._objects.push(new SceneObject(this, objName, o));
	this._sortObjects();
};

Scene.prototype._sortObjects = function () {
	this._sortedObjects = [];
	for (var objName in this._objects) {
		this._sortedObjects.push(this._objects[objName]);
	}
	this._sortedObjects.sort(function (o1, o2) {
		return o1._zIndex - o2._zIndex;
	});
};

Scene.prototype.draw = function () {
	if (this._bgColor) {
		ctx.fillStyle = this._bgColor;
		ctx.fillRect(this._left, this._top, this._width, this._height);
	}
	if (this._bgImage)
		ctx.drawImage(this._bgImage, this._left, this._top, this._width, this._height);
	for (var i = 0; i < this._sortedObjects.length; i++) {
		this._sortedObjects[i].draw();
	}
};

Scene.prototype.attr = function () {
	if (arguments.length === 1)
		return this['_' + arguments[0]];
	else {
		this['_' + arguments[0]] = arguments[1];
		return this;
	}
};

Scene.prototype.remove = function () {
	for (var objName in this._objects) {
		this._objects[objName].remove();
	}
};

Scene.prototype.hide = function () {
	this._isVivible = false;
};

Scene.prototype.show = function () {
	this._isVivible = true;
};

function SceneObject(_scene, objName, o) {
	this._scene = _scene;
	this._objName = objName;
	this._hoverStyles = {};

	this._addClassesStyles(o, objName);

	this._setEventListeners(o, objName);

	this._setDimensions(o);

	this._setShape(o);

	this._setBgImage(o);

	this._zIndex = (o.zIndex || 0) + this._scene.attr('zIndex');

	this._setText(o);

	this._createActiveObjectFromSelf();
}

var _p = SceneObject.prototype;

_p._addClassesStyles = function (o, class_name) {
	ext(class_name);

	function ext(class_name) {
		if (class_name in styles) {
			for (var prop in styles[class_name]) {
				if (prop === 'extend')
					ext(styles[class_name].extend);
				else
					o[prop] = styles[class_name][prop];
			}
		}
	}
};

_p._setEventListeners = function (o, objName) {

	var self = this;

	this._onClick = o.onClick && o.onClick.bind(this) || null;

	if (objName + 'Hover' in styles || o.onHover || o.onMouseOut) {

		this._setHoverStyle(objName + 'Hover');

		this._onHover = function () {
			o.onHover && o.onHover.call(self);
			self._hover = true;
			self._scene._trigger('dirt');
		};

		this._onMouseOut = function () {
			o.onMouseOut && o.onMouseOut.call(self);
			self._hover = false;
			self._scene._trigger('dirt');
		};
	}
};

_p._setHoverStyle = function (class_name) {
	var self = this;
	extHover(class_name);
	
	function extHover(class_name) {
		if (class_name in styles) {
			for (var prop in styles[class_name]) {
				if (prop === 'extend')
					extHover(styles[class_name].extend);
				else
					self._hoverStyles['_' + prop] = styles[class_name][prop];
			}
		}
	}
};

_p._setShape = function (o) {
	this._shape = o.shape || 'rect';
	this._cornerRadius = o.cornerRadius || 0;
	this._bgColor = o.bgColor || '';
	this._borderWidth = o.borderWidth || 0;
	this._borderColor = o.color || o.borderColor || 'black';
};

_p._setBgImage = function (o) {
	if (!o.bgImage)
		return;

	this._bgImage = o.bgImage;
	this._imgWidth = o.imgWidth || o.bgImage.width;
	this._imgHeight = o.imgHeight || o.bgImage.height;
};


_p._setDimensions = function (o) {
	this._left = (o.left || 0) + this._scene.attr('left');
	this._top = (o.top || 0) + this._scene.attr('top');
	this._width = o.width || this._scene.attr('width');
	this._height = o.height || this._scene.attr('height');
	if (o.alignCenter) {
		this._left += (this._scene.attr('width') - this._width) / 2;
	}
	if (o.alignVertical)
		this._top += (this._scene.attr('height') - this._height) / 2;
};

_p._setText = function (o) {
	this._text = o.text || '';
	if (!this._text)
		return;

	this._textFromLeft = (o.textFromLeft || 0) + this._left;
	this._textFromTop = (o.textFromTop || 0) + this._top;

	this._color = o.color || '#000';
	this._fontSize = o.fontSize || '12px';
	this._textBaseLine = o.textBaseline || 'top';
	this._fontFamily = o.fontFamily || 'Arial';
	this._textAlign = o.textAlign || 'left';
};



_p._createActiveObjectFromSelf = function () {
	this._ao = activeObjects.add({
		left: this._left,
		top: this._top,
		width: this._width,
		height: this._height,
		zIndex: this._zIndex,
		leftClick: this._onClick,
		onHover: this._onHover,
		onMouseOut: this._onMouseOut,
		fromCenter: false
	});
};

_p.draw = function () {
	var o = extend({}, this);
	
	o._hover && extend(o, o._hoverStyles);
	
	(o._bgColor || o._borderWidth > 0) && this._drawBackground(o);

	o._bgImage && this._drawBgImage(o);

	o._text && this._drawText(o);
};

_p._drawBackground = function (o) {
	ctx.lineWidth = o._borderWidth;
	ctx.strokeStyle = o._borderColor;
	ctx.fillStyle = o._bgColor;

	var isFill = !!o._bgColor;
	var isStroke = (o._borderWidth > 0);

	if (o._shape === 'rect') {
		ctx.roundRect(o._left, o._top, o._width, o._height, o._cornerRadius, isFill, isStroke);
	}
};

_p._drawBgImage = function (o) {
	var img = o._scene.getBoard().imgManager.get(o._bgImage);
	ctx.drawImage(img, o._left, o._top, o._imgWidth, o._imgHeight);
};

_p._drawText = function (o) {
	ctx.fillStyle = o._color;
	ctx.font = o._fontSize + ' ' + o._fontFamily;
	ctx.textBaseline = o._textBaseLine;
	ctx.textAlign = o._textAlign;
	ctx.fillText(o._text, o._textFromLeft, o._textFromTop);
};

_p.remove = function () {
	this._ao && this._ao.remove();
	delete this._scene[this._objName];
};

_p.attr = function () {
	if (arguments.length === 1)
		return this['_' + arguments[0]];
	else {
		this['_' + arguments[0]] = arguments[1];
		this._scene._trigger('dirt');
		return this;
	}
};

var styles = {

	// Main Page
	tile: {
		width: 140,
		height: 80,
		alignCenter: true,
		top: 280,
		color: '#6bf',
		textAlign: 'center',
		fontSize: '20px',
		textBaseline: 'middle',
		textFromTop: 80 / 2,
		textFromLeft: 140 / 2,
		zIndex: 2,
		cornerRadius: 30,
	},
	tileHover: {
		bgColor: '#00A',
		color: '#EEE',
		borderWidth: 4
	},
	castleImage: {
		left: 100,
		top: 50,
		bgImage: 'castle-in-clouds',
		imgWidth: 400,
		imgHeight: 390,
		zIndex: 1
	},
	title: {
		left: 530,
		top: 150,
		width: 160,
		zIndex: 2,
		text: 'Castle Escape',
		color: '#6bf',
		fontSize: '40px',
		textBaseline: 'middle'
	},
	sky: {
		height: 430,
		bgColor: '#05f'
	},
	ground: {
		top: 380,
		height: 500,
		bgColor: '#421'
	},
	HOME_author: {
		alignCenter: true,
		width: 100,
		top: 700,
		height: 40,
		color: '#CCC',
		text: "Maciej Bukowski, 2015"
	},
	play: {
		text: 'Play',
		left: 0,
		extend: 'tile'
	},
	playHover: {
		extend: 'tileHover'
	},
	resume: {
		left: 160,
		text: 'Continue',
		extend: 'tile'
	},
	resumeHover: {
		extend: 'tileHover'
	},
	credits: {
		text: 'Credits',
		left: 320,
		extend: 'tile'
	},
	creditsHover: {
		extend: 'tileHover'
	},
	settings: {
		text: 'Settings',
		left: 480,
		extend: 'tile'
	},
	settingsHover: {
		extend: 'tileHover'
	},


	// Credits
	author: {
		zIndex: 3,
		top: 100,
		width: 400,
		height: 50,
		alignCenter: true,
		text: "Author: Maciej Bukowski",
		textFromLeft: 200,
		textFromTop: 25,
		fontSize: "30px",
		color: "#999",
		textAlign: "center",
		textBaseline: "middle"
	},

	authorHover: {
		color: 'red',
	},

	bg: {
		zIndex: 2,
	},
	graphics: {
		extend: 'author',
		top: 200,
		text: 'Graphics:',
		zIndex: 1
	},
};

//#### src/js/classes/ScreenTurbulence.js
function TurbulenceManager(maxScreenDelta) {
	this._turbulences = [];
	this._maxScreenDelta = maxScreenDelta;
}

var _p = TurbulenceManager.prototype;

_p.getDelta = function () {
	var x = 0;
	var y = 0;
	for (var i = 0; i < this._turbulences.length; i++) {
		x += this._turbulences[i].getX();
		y += this._turbulences[i].getY();
	}
	if (Math.abs(x) > this._maxScreenDelta)
		x = x / Math.abs(x) * this._maxScreenDelta;

	if (Math.abs(y) > this._maxScreenDelta)
		y = y / Math.abs(y) * this._maxScreenDelta;

	return {
		x: x,
		y: y
	}
};

_p.setRandomValues = function () {
	for (var i = 0; i < this._turbulences.length; i++) {
		this._turbulences[i].setRandomValues();
	}
};

_p.add = function (time, altitude) {
	var t = new Turbulence(time, altitude);
	this._turbulences.push(t);
	this._setExpiredEventListener(t);
};

_p._setExpiredEventListener = function (t) {
	var self = this;
	t._addEventListener('expired', function () {
		var index = self._turbulences.indexOf(this);
		self._turbulences.splice(index, 1);
	}.bind(this));
};

function Turbulence(time, altitude) {
	extend(this, new EventEmitter());
	this._timeLeft = time;
	this._altitude = altitude;
	this._x = 0;
	this._y = 0;
	this.setRandomValues();
	this.vibrate(time);
}
_p = Turbulence.prototype;

_p.vibrate = function(time) {
	if(user.vibrate && settings.getPropValue('vibration'))
		user.vibrate(time * fps.get()); 
};

_p.setRandomValues = function () {
	this._timeLeft--;
	if (this._timeLeft <= 0)
		this._trigger('expired');
		
	this._x = (2 * Math.random() - 1) * this._altitude;
	this._y = (2 * Math.random() - 1) * this._altitude;
};

_p.getX = function () {
	return this._x;
};

_p.getY = function () {
	return this._y;
};

//#### src/js/classes/Settings.js
function Settings() {
	extend(this, new EventEmitter());
	this._options = {};
	this._storageOptions = {};
	this.setDefaultOptions();
	this._assignments = new Assignments();
	this._loadSettingsFromStorage();
}

var _p = Settings.prototype;

_p.setDefaultOptions = function () {
	// Can be stored in external JSON file
	var options = this._options = {
		AUDIO_VOLUME: {
			value: 1,
			valueType: 'number',
			settingsType: 'audio',
			inputType: 'range',
			minValue: 0,
			maxValue: 1,
			step: 0.1
		}
	};

	(function createNiceNames() {
		for (var propName in options) {
			var o = options[propName];
			o.niceName = propName.replace('_', ' ').toLowerCase();
			o.niceName = propName[0] + o.niceName.substr(1);
		}
	})();
};

_p.getAssignments = function () {
	return this._assignments;
};

_p.getPropValue = function (property) {
	return this._options[property].value;
};

_p.getAll = function () {
	return this._options;
};

_p.setPropValue = function (property, value) {
	var op = this._options[property];
	if (op.valueType === 'number') 
		value = Number(value);

	if (op.valueType === 'boolean') {

		value = value === 'true' || 
			value === true ||
			value === 1 ||
		 	value === '1';

	}

	this._options[property].value = value;
	this._save();
	this._trigger('change', property, value);
};

_p._loadSettingsFromStorage = function () {
	var data = localStorage.getItem('Warrior-settings') || '{}';
	var storageOptions = JSON.parse(data);

	for (var propName in storageOptions) {
		if (propName in this._options) {
			this._options[propName].value = storageOptions[propName];
		}
	}
};

_p._save = function () {
	var values = {};
	for (var propName in this._options) {
		values[propName] = this._options[propName].value;
	}

	var data = JSON.stringify(values);
	localStorage.setItem('Warrior-settings', data);
};

//#### src/js/classes/SettingsGUI.js
function SettingsGUI(html) {
	$('body').append(html);

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
	var dest = $('#right-panel')[0];
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
	var dest = $('#right-panel')[0];

	for (var optionName in options) {
		if (!options.hasOwnProperty(optionName))
			continue;

		var op = options[optionName];
		if (op.settingsType !== settingsType)
			continue;

		var div = $('<div>').html(op.niceName)[0];
		dest.appendChild(div);

		var input = $('<input>')[0];
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
	var dest = $('#right-panel')[0];
	var list = this._assignments.getList();

	for (var action in list) {
		var outerDiv = $('<div>')[0];
		$(outerDiv).addClass('binding');

		var div = $('<div>')[0];
		$(div).html(action).addClass('action-name');
		outerDiv.appendChild(div);

		div = $('<div>')[0];
		this._actionsList[action] = div;
		$(div).html(list[action]).addClass('key-name');
		outerDiv.appendChild(div);

		dest.appendChild(outerDiv);
	}
};

_p._addBindingsEventListeners = function () {
	var self = this;

	window.addEventListener('click', clickHandler);
	window.addEventListener('keydown', keydownHandler);
	this._assignments._addEventListener('changeAssignnment', changeAssignmentHandler);

	function clickHandler(e) {
		var div = document.getElementsByClassName('key-name active')[0];
		if (div)
			$(div).removeClass('active');

		if ($(e.target).hasClass('key-name')) {
			var action = e.target.previousElementSibling.innerHTML;

			self._assignments.setActiveBinding(action);
			$(e.target).addClass('active');
		}
	}

	function changeAssignmentHandler(action) {
		self._actionsList[action].innerHTML = self._assignments.getList()[action];
	}

	function keydownHandler(e) {
		var div = document.getElementsByClassName('key-name active')[0];
		if (div) {
			self._assignments.tryBind(e.keyCode);
			e.preventDefault();
			e.stopPropagation();
		} else if (user.actions.Settings) {
			removeEventListeners();
			self.removeSettings();
		}
	}

	function removeEventListeners() {
		window.removeEventListener('click', clickHandler);
		window.removeEventListener('keydown', keydownHandler);
		self._assignments._removeEventListener('changeAssignnment', changeAssignmentHandler);
	}
};

_p.removeSettings = function() {
	//remove listeners
	$('#settings').remove();
	$('#settings-style').remove();
	history.back();
};

//#### src/js/classes/User.js
function User() {
	this.lang = navigator.language || navigator.userLanguage || 'pl';
	this.cores = navigator.hardwareConcurrency || 4;
	this.touchPoints = navigator.maxTouchPoints;
	this.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
	this.keys = {};
	this._setEventListeners();
	this.actions = {};
}

User.prototype._setEventListeners = function() {
	var self = this;
	window.addEventListener('keydown', function(e) {
		var assignments = settings.getAssignments();
		var action = assignments.getActionFromCode(e.keyCode);
		if (action)
			self.actions[action] = true;
		self.keys[e.keyCode] = true;

	});
	window.addEventListener('keyup', function(e) {
		var assignments = settings.getAssignments();
		var action = assignments.getActionFromCode(e.keyCode);
		if (action)
			self.actions[action] = false;
		self.keys[e.keyCode] = false;
	});
	window.addEventListener('blur', function() {
		self.keys = {};
	});
}

//#### src/js/classes/World.js
function World(game) {
	this._game = game;
	this._layers = [];
	this._tileSets = [];
	this._sprites = {};
	this._objects = [];
	this._objectsOnScreen = [];
	this._objectTypes = [];
	this._loadData();
	this._turbulenceManager = new TurbulenceManager();
	extend(this, new EventEmitter());
}

World.prototype._loadData = function() {
	var self = this;
	loadJSON('data/castle.json')
		.then(function(map) {
			// map
			self.width = map.width;
			self.height = map.height;
			self.outputTileWidth = map.tilewidth;
			self.outputTileHeight = map.tileheight;
			self.tileFactor = self.outputTileHeight / self.outputTileWidth;
			self._layers = map.layers;
			self._createMapFromImportedData(map.layers);

			for (var i = 0; i < map.tilesets.length; i++) {
				self._tileSets.push(new TileSet(map.tilesets[i]));
			}

			self._createStaticObjects(map, self);

			self._trigger('loaded');
		});
};

World.prototype._createMapFromImportedData = function(layers) {
	this._map = createArray(layers.length, this.width, this.width);
	for (var i = 0; i < layers.length; i++) {
		var data = layers[i].data;
		if (data) {
			var w = this.width;
			for (var n = 0; n < data.length; n++) {
				var x = n % w;
				var y = n / w | 0;
				this._map[i][x][y] = data[n];
			}
		}
	}
};

World.prototype.drawLayers = function() {

	var mapEdges = this._calculateMapEdges();
	
	for (var i = 0; i < this._layers.length; i++) {
		var l = this._layers[i];
		if (l.data) {
			for (var y = mapEdges.startY; y < mapEdges.endY; y++) {
				for (var x = mapEdges.startX; x < mapEdges.endX; x++) {

					var relPosition = this.relativate(x * this.outputTileWidth, y * this.outputTileHeight);
					var screenX = relPosition.x;
					var screenY = relPosition.y;

					// UWAGA - 0
					this._tileSets[0].draw(screenX, screenY, l.data[this.width * y + x]);
				}

			}
		}
	}
};

World.prototype._calculateMapEdges = function() {
	var startX = Math.floor((game._player.x - game._board.width / 2) / this.outputTileWidth - 1);
	var startY = Math.floor((game._player.y - game._board.height / 2) / this.outputTileHeight - 1);
	var endX = Math.ceil((game._player.x + game._board.width / 2) / this.outputTileWidth + 1);
	var endY = Math.ceil((game._player.y + game._board.height / 2) / this.outputTileHeight + 1);

	return {
		startX: Math.max(0, startX),
		startY: Math.max(0, startY),
		endX: Math.min(this.width, endX),
		endY: Math.min(this.height, endY)
	};
};

World.prototype.drawObjects = function() {
	this._objectsOnScreen = [];
	this._objects.sort(function(o1, o2) {
		if ((o1.y + o1.height) - (o2.y + o2.height) === 0) {
			return o1.x - o2.x;
		} else return (o1.y + o1.height) - (o2.y + o2.height);
	});
	for (var i = 0; i < this._objects.length; i++) {
		this._objectsOnScreen.push(this._objects[i]); // Do zmiany!!
		var object = this._objects[i];
		object.draw();
	}
};

World.prototype._createStaticObjects = function(map) {
	var i,
		imageArray = [];

	for (i = 0; i < map.tilesets.length; i++) {
		var t = map.tilesets[i];
		if (!t.hasOwnProperty('image')) {
			for (var index in t.tiles) {
				imageArray[(+index) + (+t.firstgid)] = t.tiles[index].image;
			}
		}
	}

	for (i = 0; i < map.layers.length; i++) {
		var currentLayer = map.layers[i];
		if (currentLayer.objects) {
			for (var j = 0; j < currentLayer.objects.length; j++) {
				var currentObject = currentLayer.objects[j];
				var go = new GameObject(this, {
					url: imageArray[currentObject.gid],
					x: currentObject.x,
					y: currentObject.y - currentObject.height,
					visible: currentObject.visible,
					name: currentObject.name
				});

				this.addObject(go);
			}
		}
	}
};

World.prototype.addObject = function(o) {
	this._objects.push(o);
};

World.prototype.relativate = function (x, y) {
	var turbulences = this._turbulenceManager.getDelta();
	return {
		x: Math.floor(x + turbulences.x - game._player.x - game._player.width / 2 + game._board.width / 2),
		y: Math.floor(y + turbulences.y - game._player.y - game._player.height / 2 + game._board.height / 2)
	};
};



/***** TILESET CLASS *****/
function TileSet(tileSetProperties) {
	extend(this, tileSetProperties);
	this.load();
}

TileSet.prototype.load = function() {
	if (this.image) {
		this.rows = this.imageheight / this.tileheight;
		this.cols = this.imagewidth / this.tilewidth;

		this.img = new Image();
		this.img.src = this.image;
	} else {
		this.images = [];
		for (var index in this.tiles) {
			var i = new Image();
			i.src = this.tiles[index].image;
			this.images.push(i);
		}
	}
};

TileSet.prototype.draw = function(screenX, screenY, index) {
	index -= this.firstgid;

	if(index < 0) {
		// console.error('index < 0');
		index = 0;
	}
	
	var left = (index % this.cols) * this.tilewidth;
	var top = (index / this.cols | 0) * this.tileheight;

	
	ctx.drawImage(this.img, left, top, this.tilewidth, this.tileheight,
		screenX, screenY, this.tilewidth, this.tileheight
	);
};