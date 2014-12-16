var PrimaryDecorators = di.service('PrimaryDecorators', [
  'EntityDecorator', 'GameModel as gm', 'Entity']);

PrimaryDecorators.prototype.init = function() {
  this.entityDecorator_.addDecoratorObj(this, 'primary');
};

PrimaryDecorators.prototype.decorateGrenade_ = function(obj) {
  var spec = {
    dmg: 15,
    speed: 200,
    radius: 20,
    accuracy: _.radians(40),
    cooldown: 2
  };

  var cooldown = 0;
  obj.act(function(dt) {
    cooldown -= dt;
    if (cooldown <= 0) {
      this.fireBomb_(obj, dt, spec);
      cooldown += spec.cooldown;
    }
  }.bind(this));
};

PrimaryDecorators.prototype.decorateShotgun_ = function(obj) {
  var spec = {
    dmg: 5,
    speed: 550,
    accuracy: _.radians(30)
  };
  var BLAST_SIZE = 5;
  var BLAST_SPREAD = _.radians(40);
  var CHARGE_TIME = 2;

  var cooldown = 0;
  obj.act(function(dt) {
    if (obj.dead) return;
    cooldown -= dt;
    if (cooldown <= 0) {
      for (var i = 0; i < BLAST_SIZE; i++) {
        spec.dangle = (BLAST_SPREAD / BLAST_SIZE) * i - BLAST_SPREAD / 2;
        this.fireLaser_(obj, spec, dt, 'pellet');
      }
      cooldown += CHARGE_TIME;
    }
  }.bind(this));
};

PrimaryDecorators.prototype.decorateRazors_ = function(obj) {
  var spec = {
    dmg: 9,
    speed: 350,
    radius: 6,
    spread: _.radians(60),
    projectiles: 3,
    accuracy: _.radians(10),
    cooldown: 2
  };

  var cooldown = 0;
  obj.act(function(dt) {
    if (obj.dead) return;
    cooldown -= dt;
    if (cooldown <= 0) {
      for (var i = 0; i < spec.projectiles; i++) {
        spec.dangle = (spec.spread / spec.projectiles) * i - spec.spread / 2;
        this.fireBlade_(obj, spec, dt);
      }
      cooldown += spec.cooldown;
    }
  }.bind(this));
};

PrimaryDecorators.prototype.decorateLaser_ = function(obj) {
  var spec = {
    dmg: 5,
    speed: 300,
    accuracy: _.radians(40),
    dangle: 0
  };
  var BURST_CHARGE_TIME = 2;
  var BURST_SIZE = 4;
  var CHARGE_TIME = .08;

  var burtCooldown = 0;
  var burstRemaining = 0;
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
        this.fireLaser_(obj, spec, dt);
        cooldown += CHARGE_TIME;
        burstRemaining--;
      }
    }
  }.bind(this));
};

PrimaryDecorators.prototype.fireLaser_ = function(obj, spec, dt, style) {
  var d = this.entityDecorator_.getDecorators();
  var laser = this.entity_.create('laser');
  laser.style = style;
  _.decorate(laser, d.shape.line, spec);
  this.fireProjectile_(laser, obj, spec, dt);
};

PrimaryDecorators.prototype.fireBomb_ = function(obj, spec, dt) {
  var d = this.entityDecorator_.getDecorators();
  var bomb = this.entity_.create('bomb');
  _.decorate(bomb, d.shape.circle, spec);
  this.fireProjectile_(bomb, obj, spec, dt);
};

PrimaryDecorators.prototype.fireBlade_ = function(obj, spec, dt) {
  var d = this.entityDecorator_.getDecorators();
  var blade = this.entity_.create('blade');
  _.decorate(blade, d.shape.circle, spec);
  this.fireProjectile_(blade, obj, spec, dt);
};

PrimaryDecorators.prototype.fireProjectile_ = function(
    projectile, obj, spec, dt) {
  var d = this.entityDecorator_.getDecorators();
  projectile.setPos(obj.x, obj.y);
  _.decorate(projectile, d.movement.straight, spec);
  _.decorate(projectile, d.dmgCollision, spec);
  projectile.target = obj.target;

  this.gm_.entities.arr[this.gm_.entities.length++] = projectile;
  projectile.act(dt);
};
