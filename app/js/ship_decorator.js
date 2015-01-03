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

  // Collisions.
  obj.collision = {
    dmg: 10,
    disabledDuration: .75
  };
  _.decorate(obj, this.d_.collision, {collide: function() {
    if (obj.effect.collided) return;
    obj.dmg(obj.collision.dmg);
    // Move directly away from collided target.
    obj.movement.vector = _.vector.cartesian({angle: obj.c.targetAngle,
                                              length: -.5});
    obj.addEffect('disabled', obj.collision.disabledDuration);
    obj.addEffect('collided', obj.collision.disabledDuration);
  }});

  _.decorate(obj, this.d_.effectable);
  _.decorate(obj, this.sharedComputation_);
};
