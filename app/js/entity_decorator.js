var EntityDecorator = di.service('EntityDecorator',
    ['GameModel as gm', 'Entity', 'Mouse', 'Screen', 'Font', 'Random']);

EntityDecorator.prototype.init = function() {
  this.clickable = {name: 'clickable',
                    decorate: this.decorateClickable_.bind(this)};
  this.health = {name: 'health',
                 decorate: this.decorateHealth_.bind(this)};
  this.dmgCollision = {name: 'dmgCollision_',
                       decorate: this.decorateDmgCollision_.bind(this)};
  this.weapon = {
    laser: {name: 'weapon.laser',
            decorate: this.decorateLaser_.bind(this)},
    shotgun: {name: 'weapon.shotgun',
            decorate: this.decorateShotgun_.bind(this)}
  };
  this.movement = {
    radial: {name: 'movement.radial',
             decorate: this.decorateRadialMovement_.bind(this)},
    straight: {name: 'movement.straight',
               decorate: this.decorateStraightMovement_.bind(this)}
  };
  this.shape = {
    circle: {name: 'shape.circle', decorate: this.decorateCircle_.bind(this)},
    text: {name: 'shape.text', decorate: this.decorateText_.bind(this)},
    line: {name: 'shape.line', decorate: this.decorateLine_.bind(this)}
  };
};

EntityDecorator.prototype.decorateClickable_ = function(obj) {
  obj.update(function() {
    obj.mouseOver = obj.collides(this.mouse_.x, this.mouse_.y);
    obj.clicked = obj.mouseOver && this.mouse_.pressed;
  }.bind(this));
};

EntityDecorator.prototype.decorateCircle_ = function(obj, radius) {
  obj.radius = radius;
  obj.collides = function(x, y) {
    var distance = Math.hypot(Math.abs(obj.x - x), Math.abs(obj.y - y));
    return distance < obj.radius;
  };
};

/** @requires {obj.rotation} */
EntityDecorator.prototype.decorateLine_ = function(obj, size) {
  obj.collidePoints = [];
  obj.size = size;
  obj.act(function(dt) {
    obj.dx = Math.cos(obj.rotation) * size;
    obj.dy = Math.sin(obj.rotation) * size;
    var dx2 = (Math.cos(obj.rotation) * obj.speed * dt - obj.dx) / 2;
    var dy2 = (Math.sin(obj.rotation) * obj.speed * dt - obj.dy) / 2;
    obj.collidePoints = [{x: obj.x, y: obj.y},
                         {x: obj.x - obj.dx, y: obj.y - obj.dy},
                         {x: obj.x + dx2, y: obj.y + dy2}];
  });
};

EntityDecorator.prototype.decorateText_ = function(obj, text, size) {
  obj.text = text;
  obj.size = _.valueOrFn(size);

  obj.collides = function(x, y) {
    if (Math.abs(y - obj.y) > obj.size / 2) {
      return false;
    }
    var width = this.font_.width(text, obj.size);
    return Math.abs(x - obj.x) < width / 2;
  }.bind(this);

  obj.update(function(dt) {
    obj.size = _.valueOrFn(size, dt);
  });
};

EntityDecorator.prototype.decorateRadialMovement_ = function(obj, speed) {
  obj.speed = speed;
  var target;
  obj.act(function() {
    target = {x: obj.target.x, y: obj.target.y};
  });
  obj.update(function(dt) {
    if (obj.dead) return;
    var currentAngle = _.angle(target.x, target.y, obj.x, obj.y);
    var dx = obj.x - target.x;
    var dy = obj.y - target.y;
    var radius = Math.hypot(Math.abs(dx), Math.abs(dy));
    var circumference = Math.PI * radius * 2;
    var arc = obj.speed * dt;
    var additionalAngle = Math.PI * 2 * (arc / circumference);
    var nextAngle = currentAngle + additionalAngle;

    obj.x += radius * Math.cos(nextAngle) - dx;
    obj.y += radius * Math.sin(nextAngle) - dy;
  });
};

EntityDecorator.prototype.decorateStraightMovement_ = function(
    obj, specs) {
  obj.speed = specs.speed;
  var target;
  obj.awake(function() {
    obj.rotation = _.angle(obj.x, obj.y, obj.target.x, obj.target.y);
    var a = this.random_.next() * specs.accuracy;
    obj.rotation += a - a / 2;
    obj.rotation += specs.dangle;
  }.bind(this));
  obj.act(function(dt) {
    var desiredRotation = _.angle(obj.x, obj.y, obj.target.x, obj.target.y);
    var dr = desiredRotation - obj.rotation;
    if (Math.abs(dr) < specs.seek * dt) {
      obj.rotation = desiredRotation;
    } else {
      obj.rotation += specs.seek * dt * Math.sign(dr);
    }
  });
  obj.update(function(dt) {
    if (obj.dead) return;
    obj.x += Math.cos(obj.rotation) * obj.speed * dt;
    obj.y += Math.sin(obj.rotation) * obj.speed * dt;
  });
};

EntityDecorator.prototype.decorateShotgun_ = function(obj) {
  var LASER_SPECS = {
    dmg: 8,
    speed: 550,
    length: 2,
    seek: 0,
    accuracy: _.radians(30)
  };

  var BLAST_SIZE = 6;
  var BLAST_SPREAD = _.radians(20);
  var CHARGE_TIME = 1.2;
  var cooldown = 0;

  obj.act(function(dt) {
    if (obj.dead) return;
    cooldown -= dt;
    if (cooldown <= 0) {
      for (var i = 0; i < BLAST_SIZE; i++) {
        LASER_SPECS.dangle = (BLAST_SPREAD / BLAST_SIZE) * i - BLAST_SPREAD / 2;
        this.fireLaser(obj, dt, LASER_SPECS);
      }
      cooldown += CHARGE_TIME;
    }
  }.bind(this));
};

EntityDecorator.prototype.decorateLaser_ = function(obj) {
  var LASER_SPECS = {
    dmg: 4,
    speed: 300,
    length: 7,
    seek: 0,
    accuracy: _.radians(40),
    dangle: 0
  };
  var BURST_CHARGE_TIME = 2;
  var BURST_SIZE = 8;
  var burtCooldown = 0;
  var burstRemaining = 0;

  var CHARGE_TIME = .08;
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
        this.fireLaser(obj, dt, LASER_SPECS);
        cooldown += CHARGE_TIME;
        burstRemaining--;
      }
    }
  }.bind(this));
};

EntityDecorator.prototype.fireLaser = function(obj, dt, specs) {
  var d = this;
  var laser = this.entity_.create('laser');
  laser.style = specs.dmg < 5 ? 'weak' : 'strong';
  laser.setPos(obj.x, obj.y);
  _.decorate(laser, d.movement.straight, specs);
  _.decorate(laser, d.shape.line, specs.length);
  _.decorate(laser, d.dmgCollision, specs.dmg);
  laser.target = obj.target;

  var rep = this.gm_.rep['laser'] = this.gm_.rep['laser'] + 1 || 1;
  this.gm_.entities['laser' + rep] = laser;
  laser.act(dt);
};

EntityDecorator.prototype.decorateHealth_ = function(obj, health) {
  obj.health = health;
  obj.dmg = function(dmg) {
    obj.health -= dmg;
    obj.dead = obj.health <= 0;
  };
};

EntityDecorator.prototype.decorateDmgCollision_ = function(obj, dmg) {
  obj.affect(function() {
    if (obj.dead) return;
    var collides = _.some(obj.collidePoints, function(p) {
      return obj.target.collides(p.x, p.y);
    });
    if (collides) {
      obj.target.dmg(dmg);
      obj.dead = true;
    }
  });
};
