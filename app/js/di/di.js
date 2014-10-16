var validator = window.diValidator;

/**
 * Provides dependency injection.
 */
var Di = function() {
  this.impls_ = {};
  this.implsToInit_ = {};
  this.deps_ = {};
};

Di.prototype.constant = function(name, impl) {
  this.impls_[name] = impl;
};

Di.prototype.service = function(name, opt_deps) {
  return this.addImplToInit_(name, opt_deps, 'service');
};

Di.prototype.factory = function(name, opt_deps) {
  return this.addImplToInit_(name, opt_deps, 'factory');
};

Di.prototype.addImplToInit_ = function(name, deps, type) {
  this.implsToInit_[name] = {type: type, class: function() {}};
  this.deps_[name] = deps || [];
  return this.implsToInit_[name].class;
}

Di.prototype.init = function() {
  validator.validate(this.impls_, this.implsToInit_, this.deps_);
  for (var name in this.implsToInit_) {
    this.initImpl_(name);
  }
};

Di.prototype.initImpl_ = function(name) {
  if (!this.impls_[name]) {
    this.initDeps_(name);
    this.impls_[name] = this.createImpl_(name);
  }
};

Di.prototype.initDeps_ = function(name) {
  this.deps_[name].forEach(function(dep) {
    this.initImpl_(dep);
  }.bind(this));
};

Di.prototype.createImpl_ = function(name) {
  switch (this.implsToInit_[name].type) {
    case 'service': return this.createService_(name);
    case 'factory': return this.createFactory_(name);
  }
};

Di.prototype.createService_ = function(name) {
  var service = new this.implsToInit_[name].class();
  this.addDeps_(service, this.deps_[name]);
  service.init && service.init();
  return service;
};

Di.prototype.createFactory_ = function(name) {
  var factory = {
    create: function(var_args) {
      var impl = new this.implsToInit_[name].class();
      this.addDeps_(impl, this.deps_[name]);
      impl.init && impl.init.apply(impl, arguments);
      return impl;
    }.bind(this)
  }
  return factory;
};

Di.prototype.addDeps_ = function(impl, deps) {
  deps.forEach(function(dep) {
    var privateMemberName = this.getPrivateMemberName_(dep);
    impl[privateMemberName] = this.impls_[dep];
  }.bind(this));
};

Di.prototype.getPrivateMemberName_ = function(className) {
  return className[0].toLowerCase() + className.slice(1) + '_';
};

var di = window.di = new Di();

di.constant('window', window);

window.document.addEventListener("DOMContentLoaded", function() {
  window.setTimeout(di.init.bind(di), 0);
});
