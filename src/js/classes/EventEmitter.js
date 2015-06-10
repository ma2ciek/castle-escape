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