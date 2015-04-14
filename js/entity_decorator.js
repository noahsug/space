var EntityDecorator = di.service('EntityDecorator');

EntityDecorator.prototype.init = function() {
  this.decorators_ = {};
};

EntityDecorator.prototype.getDecorators = function() {
  return this.decorators_;
};

EntityDecorator.prototype.decorate = function(entity, dna) {
  _.each(dna, function(item) {
    if (!PROD) this.validateItem_(item);
    var decorator = this.decorators_[item.category][item.type];
    _.decorate(entity, decorator, item.spec);
  }, this);
};

EntityDecorator.prototype.validateItem_ = function(item) {
  var ERROR_MSG = 'Invalid decorator: ' + item.category + '.' + item.type;
  var category = this.decorators_[item.category];
  _.assert(category && category[item.type], ERROR_MSG);
};

/**
 * Automagically add all functions that start with 'decorate' and end with '_'
 * as decorators (e.g. 'decorateMoveFast_').
 */
EntityDecorator.prototype.addDecoratorObj = function(obj, category) {
  var fns = _.pickFunctions(obj, {prefix: 'decorate', suffix: '_'});
  _.each(fns, function(fn, type) {
    this.addDecorator(category, type, fn.bind(obj));
  }, this);
};

EntityDecorator.prototype.addDecorator = function(category, type, fn) {
  var decorator = {name: category + '.' + type, decorate: fn};
  this.decorators_[category] = this.decorators_[category] || {};
  this.decorators_[category][type] = decorator;
  if (category == 'base') this.decorators_[type] = decorator;
};
