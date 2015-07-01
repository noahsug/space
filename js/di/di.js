var validator = window.diValidator;

/**
 * Provides dependency injection.
 */
var Di = function Di() {
  this.implsToInit_ = {};
  this.mappings_ = {};
  _.decorate(this, _.decorator.eventEmitter);
};

Di.prototype.ready = _.eventFn('ready');
Di.prototype.start = _.eventFn('start');

Di.prototype.constant = function(name, impl) {
  this.implsToInit_[name] = {type: 'constant', impl: impl, deps: []};
  return impl;
};

Di.prototype.service = function(name, opt_deps) {
  return this.addImplToInit_(name, opt_deps, 'service');
};

Di.prototype.factory = function(name, opt_deps) {
  return this.addImplToInit_(name, opt_deps, 'factory');
};

Di.prototype.addImplToInit_ = function(name, deps, type) {
  if (!PROD) validator.validateAddImplToInit_(name, deps);
  var parsedDeps = this.parseDeps_(deps || []);
  var ImplClass = function() {};
  this.implsToInit_[name] = {
    type: type,
    class: ImplClass,
    deps: parsedDeps.deps,
    depRenames: parsedDeps.renames
  };
  return this.implsToInit_[name].class;
}

Di.prototype.parseDeps_ = function(deps) {
  var parsedDeps = {deps: [], renames: {}};
  deps.forEach(function(dep) {
    var split = dep.split(' as ');
    if (split.length == 2) {
      dep = split[0];
      parsedDeps.renames[dep] = split[1];
    }
    parsedDeps.deps.push(dep);
  });
  return parsedDeps;
};

Di.prototype.map = function(mappings) {
  for (var name in mappings) {
    this.mappings_[name] = mappings[name];
  }
};

Di.prototype.init = function() {
  if (!PROD) validator.validateInit(this.implsToInit_, this.mappings_);
  this.impls_ = {};
  this.initMappings_();
  for (var name in this.implsToInit_) {
    this.initImpl_(name);
  }
};

Di.prototype.initMappings_ = function() {
  for (var to in this.mappings_) {
    var from = this.mappings_[to];
    this.implsToInit_[to] = this.implsToInit_[from];
  }
};

Di.prototype.initImpl_ = function(name) {
  if (!this.impls_[name]) {
    this.initDeps_(name);
    this.impls_[name] = this.createImpl_(name);
  }
};

Di.prototype.initDeps_ = function(name) {
  this.implsToInit_[name].deps.forEach(function(dep) {
    this.initImpl_(dep);
  }.bind(this));
};

Di.prototype.createImpl_ = function(name) {
  switch (this.implsToInit_[name].type) {
    case 'service': return this.createService_(name);
    case 'factory': return this.createFactory_(name);
    case 'constant': return this.implsToInit_[name].impl;
  }
  throw 'Invalid type: ' + name;
};

Di.prototype.createService_ = function(name) {
  var service = new this.implsToInit_[name].class();
  service.__name = name;
  this.addDeps_(service, name);
  service.init && service.init();
  return service;
};

Di.prototype.createFactory_ = function(name) {
  var factory = this.implsToInit_[name].class.prototype;
  factory.name = name;
  factory.new = function(var_args) {
    var impl = new this.implsToInit_[name].class();
    impl.__name = name;
    this.addDeps_(impl, name);
    impl.init && impl.init.apply(impl, arguments);
    return impl;
  }.bind(this);
  return factory;
};

/**
 * Only works if source is a factory.
 *
 * Use: di.extend(this, this.UiElement_)
 */
Di.prototype.extend = function(dest, source, var_args) {
  var impl = new this.implsToInit_[source.name].class();
  this.addDeps_(impl, source.name);
  _.class.extend(dest, impl);
  impl.init && impl.init.apply(dest, _.args(arguments, 2));
};

Di.prototype.addDeps_ = function(impl, name) {
  var renames = this.implsToInit_[name].depRenames;
  this.implsToInit_[name].deps.forEach(function(dep) {
    var privateMemberName = this.getPrivateMemberName_(
        renames[dep] || dep, this.implsToInit_[dep].type);
    impl[privateMemberName] = this.impls_[dep];
  }.bind(this));
};

Di.prototype.getPrivateMemberName_ = function(className, type) {
  return type == 'factory' ?
      className + '_' :
      className[0].toLowerCase() + className.slice(1) + '_';
};

Di.prototype.get = function(name) {
  return this.impls_[name];
};

Di.prototype.clone = function() {
  var di = new Di();
  di.implsToInit_ = _.clone(this.implsToInit_);
  di.mappings_ = _.clone(this.mappings_);
  return di;
};

window.di = new Di();

window.document.addEventListener("DOMContentLoaded", function() {
  di.ready();
  di.init();
  di.start();
});
