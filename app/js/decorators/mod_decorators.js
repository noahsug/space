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

//ModDecorators.prototype.decoratePrimaryCooldown_ = function(obj, spec) {
//  this.set_(obj, 'primaryCooldown', spec.cooldown);
//};

ModDecorators.prototype.mod_ = function(obj, prop, mult) {
  obj.awake(function() {
    obj[prop] *= mult;
  });
};

//ModDecorators.prototype.set_ = function(obj, prop, value) {
//  obj.mod = obj.mod || {};
//  obj.awake(function() {
//    obj[prop] = value;
//  });
//};
