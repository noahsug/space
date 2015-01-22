var AbilityDecorators = di.service('AbilityDecorators', [
  'EntityDecorator', 'DecoratorUtil as util']);

AbilityDecorators.prototype.init = function() {
  this.entityDecorator_.addDecoratorObj(this, 'ability');
};

AbilityDecorators.prototype.decorateMink_ = function(obj) {
  var spec = {
    radius: .8,
    speed: 1.25,
    dmg: .8
  };

  this.util_.mod(obj, 'radius', spec.radius);
  this.util_.mod(obj, 'speed', spec.speed);
  this.util_.mod(obj, 'primary.dmg', spec.dmg);
  this.util_.mod(obj, 'secondary.dmg', spec.dmg);
};

AbilityDecorators.prototype.decorateRage_ = function(obj) {
  var spec = {
    radius: 1.5,
    dmg: 1.5,
    enrageHealth: .5
  };

  obj.resolve(function() {
    var enrage = obj.maxHealth * spec.enrageHealth;
    if (obj.health <= enrage && obj.prevHealth > enrage) {
      obj.radius *= spec.radius;
      if (obj.primary) obj.primary.dmg *= spec.dmg;
      if (obj.secondary) obj.secondary.dmg *= spec.dmg;
      return;
    }

    if (obj.health > enrage && obj.prevHealth <= enrage) {
      this.util_.mod(obj, 'radius', 1 / spec.radius);
      this.util_.mod(obj, 'primary.dmg', 1 / spec.dmg);
      this.util_.mod(obj, 'secondary.dmg', 1 / spec.dmg);
      return;
    }
  }.bind(this));
};
