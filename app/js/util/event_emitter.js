var EventEmitter = function() {
  this.listeners_ = {};
};

EventEmitter.prototype.on = function(event, callback) {
  this.listeners_[event] = this.listeners_[event] || [];
  this.listeners_[event].push(callback);
};

EventEmitter.prototype.emit = function(event, arg) {
  if (!this.listeners_[event]) return;
  for (var i = 0; i < this.listeners_[event].length; i++) {
    this.listeners_[event][i](arg);
  }
};
