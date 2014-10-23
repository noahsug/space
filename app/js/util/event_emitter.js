var EventEmitter = function() {
  this.listeners_ = {};
};

EventEmitter.prototype.on = function(event, callback) {
  this.listeners_[event] = this.listeners_[event] || [];
  this.listeners_[event].push(callback);
};

EventEmitter.prototype.emit = function(event, opt_args) {
  _.each(this.listeners_[event] || [], function(callback) {
    callback(opt_args);
  });
};
