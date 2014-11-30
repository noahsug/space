_.decorate = function(obj, decorator, arg) {
  decorator.decorate(obj, arg);
};

_.decorator = {};

_.decorator.eventEmitter = {
  name: 'eventEmitter',
  decorate: function(obj) {
    var eventEmitter = new EventEmitter();
    obj.on = eventEmitter.on.bind(eventEmitter);
    obj.emit_ = eventEmitter.emit.bind(eventEmitter);
  }
};

_.decorator.eventEmitter.eventFn = function(event) {
  return function(opt_callbackOrArg) {
    if (_.isFunction(opt_callbackOrArg)) {
      this.on(event, opt_callbackOrArg);
    } else {
      this.emit_(event, opt_callbackOrArg);
    }
  };
};
