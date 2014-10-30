var EventEmitter = function() {
  this.listeners_ = {};
};

EventEmitter.prototype.on = function(var_events, callback) {
  var args = _.args(arguments);
  callback = _.last(args);
  var events = _.initial(args);
  events.forEach(function(event) {
    this.listeners_[event] = this.listeners_[event] || [];
    this.listeners_[event].push(callback);
  }.bind(this));
};

EventEmitter.prototype.emit = function(event, opt_args) {
  var args = _.args(arguments, 1);
  _.each(this.listeners_[event] || [], function(callback) {
    callback.apply(null, args);
  });
};
