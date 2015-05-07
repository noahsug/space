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
  obj.active = {};
  obj.movement = {};

  // Note: the order here matters.
  _.decorate(obj, this.d_.rotates);
  _.decorate(obj, this.d_.shape.circle, {radius: 17});
  _.decorate(obj, this.d_.health);
  _.decorate(obj, this.sharedComputation_);
  _.decorate(obj, this.d_.collidable);
  _.decorate(obj, this.d_.effectable);
  _.decorate(obj, this.d_.clonable);
  _.decorate(obj, this.d_.firesProjectiles);
  _.decorate(obj, this.d_.selectsTarget);
  _.decorate(obj, this.d_.shipCollision);
  _.decorate(obj, this.d_.movement.ai);

  obj.jammed = function(type) {
    var spec = obj[type];
    return obj.dead || obj.effect.silenced ||
        // Ship can't use targeted abilities while it has no target.
        obj.effect.targetlessActive && !spec.targetless ||
        obj.c.targetDis > spec.maxRange ||
        (obj.c.targetDis > spec.range && !obj.playerControlled) ||
        obj.c.targetDis < spec.minRange ||
        obj.c.targetAngleDif > spec.maxTargetAngle ||
        spec.isJammed && spec.isJammed();
  };
};
