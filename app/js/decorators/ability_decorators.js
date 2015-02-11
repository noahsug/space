var AbilityDecorators = di.service('AbilityDecorators', [
  'EntityDecorator', 'DecoratorUtil as util']);

AbilityDecorators.prototype.init = function() {
  this.entityDecorator_.addDecoratorObj(this, 'ability');
};

AbilityDecorators.prototype.decorateMink_ = function(obj, spec) {
  _.spec(obj, 'ability', spec, {
    radius: .7,
    speed: 1.3
  });

  this.util_.mod(obj, 'speed', obj.ability.speed);
  this.util_.mod(obj, 'radius', obj.ability.radius);
};

AbilityDecorators.prototype.decorateRage_ = function(obj, spec) {
  _.spec(obj, 'ability', spec, {
    radius: 1.5,
    dmg: 1.5,
    enrageHealth: .5
  });

  switch(spec.power) {
  case 2:
    obj.ability.enrageHealth *= .5;
    obj.ability.radius *= 1.1;
    obj.ability.dmg *= 1.2;
  case 1:
    obj.ability.radius *= 1.1;
    obj.ability.dmg *= 1.2;
  }

  obj.resolve(function() {
    var enrage = obj.maxHealth * obj.ability.enrageHealth;
    if (obj.health <= enrage && obj.prevHealth > enrage) {
      obj.radius *= obj.ability.radius;
      if (obj.primary) obj.primary.dmg *= obj.ability.dmg;
      if (obj.secondary) obj.secondary.dmg *= obj.ability.dmg;
      return;
    }

    if (obj.health > enrage && obj.prevHealth <= enrage) {
      this.util_.mod(obj, 'radius', 1 / obj.ability.radius);
      this.util_.mod(obj, 'primary.dmg', 1 / obj.ability.dmg);
      this.util_.mod(obj, 'secondary.dmg', 1 / obj.ability.dmg);
      return;
    }
  }.bind(this));
};
