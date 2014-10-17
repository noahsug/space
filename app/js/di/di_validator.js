var DiValidator = function() {
};

DiValidator.prototype.validateAddImplToInit_ = function(name, deps) {
  if (deps) {
    this.assert_(deps instanceof Array, name, 'has non-array deps:', deps);
  }
};

DiValidator.prototype.validateInit = function(implsToInit, mapping) {
  this.implsToInit_ = implsToInit;
  this.mapping_ = mapping;

  this.validateDeps_();
  this.validateMapping_();
};

DiValidator.prototype.validateDeps_ = function() {
  for (var name in this.implsToInit_) {
    var deps = this.implsToInit_[name].deps;
    this.checkDepsExist_(name, deps);
  }
};

DiValidator.prototype.checkDepsExist_ = function(name, deps) {
  deps.forEach(function(dep) {
    var depExists = this.implsToInit_[dep] || this.mapping_[dep];
    this.assert_(depExists, name, 'has invalid dep:', dep);
  }.bind(this));
};

DiValidator.prototype.validateMapping_ = function() {
  for (var to in this.mapping_) {
    var from = this.mapping_[to];
    this.assert_(
        this.implsToInit_[from], 'mapping is invalid:', from, '->', to);
  }
};

DiValidator.prototype.assert_ = function(truth, var_msgArgs) {
  if (!truth) {
    var msg = 'error: ' + Array.prototype.slice.call(arguments, 1).join(' ');
    throw msg;
  }
};

window.diValidator = new DiValidator();
