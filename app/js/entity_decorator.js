var EntityDecorator = di.service('EntityDecorator');

EntityDecorator.prototype.init = function() {
  this.decorators_ = {};
};

EntityDecorator.prototype.getDecorators = function() {
  return this.decorators_;
};

EntityDecorator.prototype.decorate = function(entity, entitySpec) {
  _.each(entitySpec, function(value, name) {
    _.decorate(entity, _.parse(this.decorators_, name), value);
  }, this);
};

/**
 * Automagically add all functions that start with 'decorate' as decorators.
 * Functions must be of the format 'decorateMyDecorator_'.
 */
EntityDecorator.prototype.addDecoratorObj = function(obj, opt_name) {
  var baseName = opt_name ? opt_name + '.' : '';
  for (var fnName in obj) {
    var fn = obj[fnName];
    if (_.isFunction(fn) && _.startsWith(fnName, 'decorate')) {
      var decoratorName = _.uncapitalize(fnName.slice('decorate'.length, -1));
      this.addDecorator(baseName + decoratorName, fn.bind(obj));
    }
  }
};

/**
 * Name can look like 'weapon.laser' and it will be magically parsed correctly.
 */
EntityDecorator.prototype.addDecorator = function(name, fn) {
  var obj = _.parse(this.decorators_, name);
  obj.name = name;
  obj.decorate = fn;
};
