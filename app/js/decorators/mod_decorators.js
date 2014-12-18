var ModDecorators = di.service('ModDecorators', [
  'EntityDecorator', 'Random']);

ModDecorators.prototype.init = function() {
  this.entityDecorator_.addDecoratorObj(this, 'mod');
};

ModDecorators.prototype.decorateHealth_ = function(obj, spec) {
  this.mod_(obj, 'health', spec.health);
};

ModDecorators.prototype.decorateSpeed_ = function(obj, spec) {
  this.mod_(obj, 'speed', spec.speed);
};

ModDecorators.prototype.decoratePrimaryCooldown_ = function(obj, spec) {
  this.mod_(obj, 'primary.cooldown', spec.cooldown);
};

ModDecorators.prototype.decorateAoe_ = function(obj, spec) {
  this.mod_(obj, 'primary.radius', spec.radius);
};

ModDecorators.prototype.mod_ = function(obj, prop, multiplier) {
  obj.awake(function() {
    var value = _.parse(obj, prop);
    _.set(obj, prop, value * multiplier);
  });
};
