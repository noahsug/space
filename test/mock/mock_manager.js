var MockManager = function() {
  this.mocks_ = {};
};

MockManager.prototype.mock = function(name) {
  return this.mocks_[name](name);
};

MockManager.prototype.register = function(name, fn) {
  this.mocks_[name] = fn;
};

window.mock = new MockManager();
