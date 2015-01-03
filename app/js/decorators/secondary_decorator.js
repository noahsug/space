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
    accuracy: _.radians(10),
    cooldown: 1.5,
    length: 4 + 16,
    duration: 1,
    style: 'effect',
    effect: 'disabled',
    range: 200
  };

  var stopMovement = function(obj) {
    obj.target.movement.vector.x = 0;
    obj.target.movement.vector.y = 0;
  };
  this.addEffectWeapon_(
      obj, this.util_.fireLaser.bind(this.util_), stopMovement);
};

SecondaryDecorators.prototype.decorateEmp_ = function(obj) {
  obj.secondary = {
    dmg: 2,
    speed: 300,
    accuracy: _.radians(10),
    cooldown: 1.5,
    radius: 20,
    duration: 1.5,
    effect: 'weaponsDisabled',
    range: 200
  };

  this.addEffectWeapon_(obj, this.util_.fireBomb.bind(this.util_));
};

// TODO: Implement.
SecondaryDecorators.prototype.decorateCharge_ = function(obj) {
  obj.secondary = {
    dmg: 2,
    speed: 300,
    accuracy: _.radians(40),
    cooldown: 1.5,
    radius: 20,
    duration: 1.5,
    effect: 'weaponsDisabled'
  };

  this.addEffectWeapon_(obj, this.util_.fireBomb.bind(this.util_));
};

SecondaryDecorators.prototype.addEffectWeapon_ = function(
    obj, fire, opt_onCollide) {
  this.util_.addWeapon(obj, obj.secondary, function() {
    var projectile = fire(obj, obj.secondary);
    obj.secondary.collide = function(obj, spec) {
      this.effect_(obj, spec);
      opt_onCollide && opt_onCollide(obj);
    }.bind(this);
    _.decorate(projectile, this.d_.collision, obj.secondary);
  }.bind(this));
};

SecondaryDecorators.prototype.effect_ = function(obj, spec) {
  if (spec.effect) {
    obj.target.addEffect(spec.effect, spec.duration);
  }
  if (spec.dmg) {
    obj.target.dmg(spec.dmg);
  }
  obj.dead = true;
};
