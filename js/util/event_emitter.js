var EventEmitter = function() {
  this.listeners_ = {};
};

EventEmitter.prototype.on = function(event, callback, opt_context) {
  this.listeners_[event] = this.listeners_[event] || [];
  this.listeners_[event].push(callback.bind(opt_context));
};

EventEmitter.prototype.emit = function(
    event, arg1, arg2, arg3, arg4, arg5, arg6) {
  if (!this.listeners_[event]) return;
  for (var i = 0; i < this.listeners_[event].length; i++) {
    this.listeners_[event][i](arg1, arg2, arg3, arg4, arg5, arg6);
  }
};

_.eventFn = function(event) {
  return function(opt_callbackOrArg, opt_contextOrArg, arg3, arg4, arg5, arg6) {
    if (_.isFunction(opt_callbackOrArg)) {
      this.on(event, opt_callbackOrArg, opt_contextOrArg);
    } else {
      this.emit_(
          event, opt_callbackOrArg, opt_contextOrArg, arg3, arg4, arg5, arg6);
    }
  };
};
