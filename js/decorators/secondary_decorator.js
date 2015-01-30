var SecondaryDecorators = di.service('SecondaryDecorators', [
  'EntityDecorator', 'DecoratorUtil as util']);


SecondaryDecorators.prototype.init = function() {
  this.d_ = this.entityDecorator_.getDecorators();
  this.entityDecorator_.addDecoratorObj(this, 'secondary');
};

SecondaryDecorators.prototype.decoratePistol_ = function(obj, spec) {
  obj.secondary = _.options(spec, {
    dmg: 3,
    speed: 300,
    accuracy: _.radians(10),
    cooldown: 1.25,
    length: 6 + 16,
    range: 300
  });

  switch(spec.power) {
  case 2:
    obj.secondary.cooldown *= .75;
  case 1:
    obj.secondary.dmg *= 1.5;
  }

  this.util_.addWeapon(obj, obj.secondary, function() {
    var projectile = this.util_.fireLaser(obj, obj.secondary);
    _.decorate(projectile, this.d_.dmgCollision, obj.secondary);
  }.bind(this));
};

SecondaryDecorators.prototype.decorateStun_ = function(obj, spec) {
  obj.secondary = _.options(spec, {
    dmg: 1,
    speed: 300,
    accuracy: _.radians(10),
    cooldown: 1.5,
    length: 4 + 16,
    duration: .9,
    style: 'effect',
    effect: 'disabled',
    range: 150,
    power: 0
  });

  switch(spec.power) {
  case 1:
    obj.secondary.duration *= 1.5;
  }

  var stopMovement = function(obj) {
    obj.target.movement.vector.x = 0;
    obj.target.movement.vector.y = 0;
  };
  this.addEffectWeapon_(
      obj, this.util_.fireLaser.bind(this.util_), stopMovement);
};

SecondaryDecorators.prototype.decorateEmp_ = function(obj, spec) {
  obj.secondary = _.options(spec, {
    dmg: 3,
    speed: 200,
    accuracy: _.radians(10),
    cooldown: 1.5,
    radius: 18,
    duration: 1.5,
    style: 'effect',
    effect: 'weaponsDisabled',
    range: 150,
    power: 0
  });

  switch(spec.power) {
  case 1:
    obj.secondary.duration *= 1.5;
    obj.secondary.radius *= .85;
  }

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
