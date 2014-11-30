var WeaponDecorators = di.service('WeaponDecorators', [
  'EntityDecorator', 'GameModel as gm', 'Entity']);

WeaponDecorators.prototype.init = function() {
  this.entityDecorator_.addDecoratorObj(this, 'weapon');
};

WeaponDecorators.prototype.decorateShotgun_ = function(obj) {
  var LASER_SPEC = {
    dmg: 1,
    speed: 550,
    length: 2,
    seek: 0,
    accuracy: _.radians(30)
  };

  var BLAST_SIZE = 100;
  var BLAST_SPREAD = _.radians(20);
  var CHARGE_TIME = 1.2;
  var cooldown = 0;

  obj.act(function(dt) {
    if (obj.dead) return;
    cooldown -= dt;
    if (cooldown <= 0) {
      for (var i = 0; i < BLAST_SIZE; i++) {
        LASER_SPEC.dangle = (BLAST_SPREAD / BLAST_SIZE) * i - BLAST_SPREAD / 2;
        this.fireLaser(obj, dt, LASER_SPEC);
      }
      cooldown += CHARGE_TIME;
    }
  }.bind(this));
};

WeaponDecorators.prototype.decorateLaser_ = function(obj) {
  var LASER_SPEC = {
    dmg: 1,
    speed: 300,
    length: 7,
    seek: 0,
    accuracy: _.radians(40),
    dangle: 0
  };
  var BURST_CHARGE_TIME = 2;
  var BURST_SIZE = 100;
  var burtCooldown = 0;
  var burstRemaining = 0;

  var CHARGE_TIME = .01;
  var cooldown = 0;

  obj.act(function(dt) {
    if (obj.dead) return;
    if (burtCooldown <= dt) {
      burstRemaining = BURST_SIZE;
      burtCooldown = BURST_CHARGE_TIME;
      cooldown = 0;
    }
    burtCooldown -= dt;

    if (burstRemaining > 0) {
      cooldown -= dt;
      if (cooldown <= 0) {
        this.fireLaser(obj, dt, LASER_SPEC);
        cooldown += CHARGE_TIME;
        burstRemaining--;
      }
    }
  }.bind(this));
};

WeaponDecorators.prototype.fireLaser = function(obj, dt, spec) {
  var d = this.entityDecorator_.getDecorators();
  var laser = this.entity_.create('laser');
  laser.style = spec.dmg < 5 ? 'weak' : 'strong';
  laser.setPos(obj.x, obj.y);
  _.decorate(laser, d.movement.straight, spec);
  _.decorate(laser, d.shape.line, spec);
  _.decorate(laser, d.dmgCollision, spec);
  laser.target = obj.target;

  this.gm_.entities.arr[this.gm_.entities.length++] = laser;
  laser.act(dt);
};
