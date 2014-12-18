var SecondaryDecorators = di.service('SecondaryDecorators', [
  'EntityDecorator', 'DecoratorUtil as util']);


SecondaryDecorators.prototype.init = function() {
  this.d_ = this.entityDecorator_.getDecorators();
  this.entityDecorator_.addDecoratorObj(this, 'secondary');
};

SecondaryDecorators.prototype.decorateStun_ = function(obj) {
  obj.secondary = {
    dmg: 2,
    speed: 300,
    accuracy: _.radians(40),
    cooldown: 1.5,
    length: 4 + 16,
    duration: 1,
    style: 'effect',
    effect: 'stun'
  };

  this.addWeapon_(obj, function() {
    var projectile = this.util_.fireLaser(obj, obj.secondary);
    _.decorate(projectile, this.d_.collision, {
      collide: this.stun_.bind(this),
      dmg: obj.secondary.dmg,
      duration: obj.secondary.duration,
      effect: obj.secondary.effect
    });
  }.bind(this));
};

SecondaryDecorators.prototype.addWeapon_ = function(obj, fire) {
  return this.util_.addWeapon(obj, obj.secondary, fire);
};

SecondaryDecorators.prototype.stun_ = function(obj, spec) {
  _.decorate(obj.target, this.d_.freeze);
  spec.effectOver = function() {
    obj.target.unfreeze();
  };
  this.effect_(obj, spec);
};

SecondaryDecorators.prototype.effect_ = function(obj, spec) {
  _.decorate(obj.target, this.d_.effect, spec);
  if (spec.dmg) {
    obj.target.dmg(spec.dmg);
  }
  obj.dead = true;
};
