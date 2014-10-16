var DiValidator = function() {
};

DiValidator.prototype.validate = function(impls, implsToInit, deps) {
  this.impls_ = impls;
  this.implsToInit_ = implsToInit;
  this.deps_ = deps;

  for (var name in this.implsToInit_) {
    var deps = this.deps_[name];
    this.assert_(deps instanceof Array, name, 'has non-array deps:', deps);
    this.checkDepsExist_(name, deps);
  }
};

DiValidator.prototype.checkDepsExist_ = function(name, deps) {
  deps.forEach(function(dep) {
    this.assert_(this.impls_[dep] || this.implsToInit_[dep],
        name, 'has invalid dep:', dep);
  }.bind(this));
};

DiValidator.prototype.assert_ = function(truth, var_msgArgs) {
  if (!truth) {
    var msg = 'error: ' + Array.prototype.slice.call(arguments, 1).join(' ');
    throw msg;
  }
};

window.diValidator = new DiValidator();
