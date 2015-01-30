var ModDecorators = di.service('ModDecorators', [
  'EntityDecorator', 'DecoratorUtil as util']);

ModDecorators.prototype.init = function() {
  this.entityDecorator_.addDecoratorObj(this, 'mod');
};

ModDecorators.prototype.decorateHealth_ = function(obj, spec) {
  this.util_.mod(obj, 'health', spec.health);
};

ModDecorators.prototype.decorateDef_ = function(obj, spec) {
  this.util_.mod(obj, 'def', spec.def);
};

ModDecorators.prototype.decorateSpeed_ = function(obj, spec) {
  this.util_.mod(obj, 'movement.speed', spec.speed);
};

ModDecorators.prototype.decoratePrimaryCooldown_ = function(obj, spec) {
  this.util_.mod(obj, 'primary.cooldown', spec.cooldown);
};

ModDecorators.prototype.decorateAoe_ = function(obj, spec) {
  this.util_.mod(obj, 'primary.radius', spec.radius);
};

ModDecorators.prototype.decorateDisable_ = function(obj, spec) {
  this.util_.mod(obj, 'secondary.duration', spec.duration);
};