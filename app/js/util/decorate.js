_.decorate = function(obj, decorator) {
  decorator.decorate(obj);
};

_.decorator = {};

_.decorator.eventEmitter = {
  name: 'EventEmitter',
  decorate: function(obj) {
    var eventEmitter = new EventEmitter();
    obj.on = eventEmitter.on.bind(eventEmitter);
    obj.emit_ = eventEmitter.emit.bind(eventEmitter);
  }
};

_.decorator.eventEmitter.eventFn = function(event) {
  return function(opt_callbackOrArgs) {
    if (_.isFunction(opt_callbackOrArgs)) {
      this.on(event, opt_callbackOrArgs);
    } else {
      this.emit_(event, opt_callbackOrArgs);
    }
  };
};
