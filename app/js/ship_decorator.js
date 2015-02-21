var ShipDecorator = di.service('ShipDecorator', [
  'EntityDecorator', 'SharedComputation', 'DecoratorUtil as util']);

ShipDecorator.prototype.init = function() {
  this.d_ = this.entityDecorator_.getDecorators();
};

ShipDecorator.prototype.name = 'shipDecorator';

ShipDecorator.prototype.decorate = function(obj) {
  // Items.
  obj.primary = {};
  obj.secondary = {};
  obj.utility = {};
  obj.ability = {};
  obj.movement = {};

  // Note: the order here matters.
  _.decorate(obj, this.d_.selectTarget);
  _.decorate(obj, this.sharedComputation_);
  _.decorate(obj, this.d_.effectable);
  _.decorate(obj, this.d_.shipCollision);

  _.decorate(obj, this.d_.health);
  _.decorate(obj, this.d_.movement.ai);
};
