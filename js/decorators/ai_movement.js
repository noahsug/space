var AiMovement = di.service('AiMovement', [
  'EntityDecorator', 'Screen', 'DecoratorUtil as util', 'Random',
  'SharedComputation as c']);

AiMovement.prototype.init = function() {
  this.entityDecorator_.addDecorator(
      'movement', 'ai', this.aiMovement_.bind(this));
};

AiMovement.prototype.aiMovement_ = function(obj, spec) {
  obj.movement = _.options(spec, {
    speed: 0,
    accel: 4,
    vector: {x: 0, y: 0},
    intelligence: .1,
    urgeCooldown: 1.5
  });

  this.util_.onCooldown(obj, function() {
    if (obj.dead) return 0;
    this.think_(obj);
    var int = obj.movement.intelligence;
    return this.random_.nextFloat(int - .1, int + .1);
  }.bind(this));

  //this.util_.onCooldown(obj, function() {
  //  obj.movement.urge = {
  //    x: this.random_.nextInt(
  //        this.screen_.x - this.screen_.width / 2 + obj.radius,
  //        this.screen_.x + this.screen_.width / 2 - obj.radius),
  //    y: this.random_.nextInt(
  //        this.screen_.y - this.screen_.height / 2 + obj.radius,
  //        this.screen_.y + this.screen_.height / 2 - obj.radius)
  //  };
  //  return obj.movement.urgeCooldown;
  //}.bind(this));

  obj.update(function(dt) {
    if (obj.dead) return;
    this.updateVector_(obj, dt);
    this.move_(obj, dt);
  }.bind(this));
};

AiMovement.prototype.think_ = function(obj, dt) {
  //console.log('----- think ' + obj.style + ' -----');
  obj.movement.distance = this.getDesiredDistance_(obj) - 20;
  this.maybeUseDash_(obj);
  this.maybeUseTeleport_(obj);
  this.setDesiredVector_(obj);
  //console.log('result:', obj.movement.desiredVector);
};

AiMovement.prototype.getDesiredDistance_ = function(obj) {
  this.c_.rangeInfo_(obj);
  var targetIndex = 0;
  var numAttacks = 0;
  var bestNumAttacks = -9;
  var bestDistance = 2000;
  for (var i = 0; i < obj.c.ranges.length; i++) {
    var self = obj.c.ranges[i];
    var target = obj.c.targetRanges[targetIndex] || 0;
    if (self >= target) {
      numAttacks++;
      if (numAttacks > bestNumAttacks) {
        bestNumAttacks = numAttacks;
        bestDistance = self;
        continue;
      }
    } else if (self < target) {
      numAttacks--;
      i--;
      targetIndex++;
    } else if (numAttacks > bestNumAttacks) {
      bestNumAttacks = numAttacks;
      bestDistance = self;
      targetIndex++;
    }
  }

  return bestDistance;
};

AiMovement.prototype.maybeUseDash_ = function(obj) {
  if (!obj.utility.dashReady) return;
  var dd = obj.c.targetDis - obj.movement.distance;
  if (Math.abs(dd) < 35) return;

  var dir = Math.sign(dd);
  var pos = {
    x: obj.x + Math.cos(obj.c.targetAngle) * 35 * dir,
    y: obj.y + Math.sin(obj.c.targetAngle) * 35 * dir,
    collideDis: obj.collideDis
  };
  this.c_.wallDis(pos);
  if (pos.c.hitWall) return;
  if (this.random_.next() < .1) obj.utility.useDash();
};

AiMovement.prototype.maybeUseTeleport_ = function(obj) {
  if (!obj.utility.teleportReady) return;
  var dd = obj.c.targetDis - obj.movement.distance;
  if (dd < 35) return;
  if (this.random_.next() < .5) obj.utility.useTeleport();
};

AiMovement.prototype.setDesiredVector_ = function(obj) {
  var v = {x: 0, y: 0};
//  _.vector.add(v, this.getRandomUrgeVector_(obj, v));
//  _.vector.add(v, this.getCurrentDirection_(obj));
  _.vector.add(v, this.getWallXVector_(obj, 4));
  _.vector.add(v, this.getWallYVector_(obj, 4));
  _.vector.add(v, this.getEnemyDistanceVector_(obj, 4));
  _.vector.add(v, this.getCurrentPerpendicularVector_(obj, 4));
  _.vector.add(v, this.getDodgeVector_(obj, 2));
  _.vector.add(v, this.getFleeVector_(obj, 4));
  _.vector.add(v, this.getPerpendicularVector_(obj, 2, v));
  _.vector.normalize(v);
  obj.movement.desiredVector = v;
};

AiMovement.prototype.getWallXVector_ = function(obj, weight) {
  var v = {
    length: this.getWallVectorLength_(obj.c.wallDisX) * weight,
    angle: obj.c.wallDisW < obj.c.wallDisE ? 0 : -_.RADIANS_180
  };
  //console.log('wallx:', v);
  return v;
};

AiMovement.prototype.getWallYVector_ = function(obj, weight) {
  var v = {
    length: this.getWallVectorLength_(obj.c.wallDisY) * weight,
    angle: obj.c.wallDisN < obj.c.wallDisS ? _.RADIANS_90 : -_.RADIANS_90
  };
  //console.log('wally:', v);
  return v;
};

// Returns 1 at 20, 1.5 at 0, .4 at 50, .05 at 100.
AiMovement.prototype.getWallVectorLength_ = function(distance) {
  distance = Math.max(distance, 0);
  var len = 150 - Math.min(distance, 150);
  return (len * len) / (150 * 100);
};

AiMovement.prototype.getRandomUrgeVector_ = function(obj, weight) {
  if (!obj.movement.urge) return _.vector.EMPTY;
  var a = _.angle(obj, obj.movement.urge);
  if (isNaN(a)) return _.vector.EMPTY;
  var v = {length: weight, angle: a};
  //console.log('urge:', v);
  return v;
};

AiMovement.prototype.getEnemyDistanceVector_ = function(obj, weight) {
  if (!obj.movement.distance) return _.vector.EMPTY;
  var dd = obj.c.targetDis - obj.movement.distance;
  // If we're a little too close or too far, don't panic.
  if (dd < 0 && dd > -40) weight *= dd * dd / (40 * 40);
  if (dd > 0 && dd < 40) weight = (weight - 5) * dd * dd / (40 * 40) + 5;
  var v = {length: weight * Math.sign(dd), angle: obj.c.targetAngle};
  //console.log('edis:', v);
  return v;
};

AiMovement.prototype.getCurrentDirection_ = function(obj, weight) {
  if (_.vector.isEmpty(obj.movement.vector)) return _.vector.EMPTY;
  var cv = obj.movement.vector;
  var v = {length: weight, angle: _.angle(cv)};
  //console.log('cur:', v);
  return v;
};

AiMovement.prototype.getDodgeVector_ = function(obj, weight) {
  if (!obj.c.dodge || _.vector.isEmpty(obj.c.dodge)) {
    obj.movement.startDodge = obj.movement.dodging = false;
    return _.vector.EMPTY;
  }
  if (!obj.movement.startDodge) {
    obj.movement.startDodge = true;
    if (obj.utility.dashReady && this.random_.next() < .5) {
      obj.utility.useDash();
    } else if (obj.utility.teleportReady && this.random_.next() < 1) {
      obj.utility.useTeleport();
    }
  }
  var v = {
    length: -weight,
    angle: _.angle(obj.c.dodge)
  };
  //console.log('dodge:', v);
  return v;
};

AiMovement.prototype.getCurrentPerpendicularVector_ = function(obj, weight) {
  if (_.vector.isEmpty(obj.movement.vector)) return _.vector.EMPTY;
  var a = _.angle(obj.movement.vector);
  var da = a - obj.c.targetAngle;
  if (da < 0) da += _.RADIANS_360;
  var pa = obj.c.targetAngle + _.RADIANS_90 * (da < _.RADIANS_180 ? 1 : -1);
  var v = {
    length: Math.abs(Math.cos(da)) * weight,
    angle: pa
  };
  //console.log('cperp:', v);
  return v;
};

AiMovement.prototype.getFleeVector_ = function(obj, weight) {
  if (!obj.movement.fleeing) {
    if (obj.c.wallDis > 30) return _.vector.EMPTY;
    var dd = obj.movement.distance - obj.c.targetDis;
    if (dd < 50) return _.vector.EMPTY;
    if (obj.target.c.centerDis < 50) return _.vector.EMPTY;

    var dirs = ['N', 'E', 'S', 'W'];
    var oppositeDirs = ['S', 'W', 'N', 'E'];
    for (var i = 0; i < dirs.length; i++) {
      var name = 'wallDis' + dirs[i];
      if (obj.c.wallDis == obj.c[name] &&
          obj.target.c.wallDis == obj.target.c[name]) {
        obj.movement.fleeing = true;
        obj.movement.fleeDirection = oppositeDirs[i];
        if (obj.utility.dashReady && this.random_.next() < .35) {
          obj.utility.useDash();
        } else if (obj.utility.teleportReady && this.random_.next() < .35) {
          obj.utility.useTeleport();
        }
        break;
      }
    }
  }
  if (!obj.movement.fleeing) return _.vector.EMPTY;

  if (obj.c['wallDis' + obj.movement.fleeDirection] < 100) {
    obj.movement.fleeing = false;
    return _.vector.EMPTY;
  }

  var angle;
  if (obj.movement.fleeDirection == 'N') angle = _.RADIANS_270;
  if (obj.movement.fleeDirection == 'E') angle = 0;
  if (obj.movement.fleeDirection == 'S') angle = _.RADIANS_90;
  if (obj.movement.fleeDirection == 'W') angle = _.RADIANS_180;
  var v = {
    length: weight,
    angle: angle
  };

  //console.log('flee:', v);
  return v;
};

AiMovement.prototype.getPerpendicularVector_ = function(obj, weight, mv) {
  var pa = this.getClosestPerpAngle_(obj.c.targetAngle, _.angle(mv));
  var v = {length: weight, angle: pa};
  //console.log('perp:', v);
  return v;
};

AiMovement.prototype.getClosestPerpAngle_ = function(perpTo, closeTo) {
  var da = closeTo - perpTo;
  if (da < 0) da += _.RADIANS_360;
  return perpTo + _.RADIANS_90 * (da < _.RADIANS_180 ? 1 : -1);
};

AiMovement.prototype.updateVector_ = function(obj, dt) {
  if (obj.effect.disabled) return;
  var m = obj.movement;
  var dx = m.desiredVector.x - m.vector.x;
  var dy = m.desiredVector.y - m.vector.y;
  if (dx == 0 && dy == 0) return;
  var adx = Math.abs(dx);
  var ady = Math.abs(dy);
  var xAccel = m.accel * dt / 2;
  var yAccel = xAccel;
  if (xAccel + yAccel > adx + ady) {
    m.vector.x = m.desiredVector.x;
    m.vector.y = m.desiredVector.y;
    return;
  }
  if (adx < xAccel) {
    m.vector.x = m.desiredVector.x;
    yAccel += xAccel - adx;
    xAccel = 0;
  } else if (ady < yAccel) {
    m.vector.y = m.desiredVector.y;
    xAccel += yAccel - ady;
    yAccel = 0;
  }
  m.vector.x += Math.sign(dx) * xAccel;
  m.vector.y += Math.sign(dy) * yAccel;
};

AiMovement.prototype.move_ = function(obj, dt) {
  obj.prevX = obj.x;
  obj.prevY = obj.y;
  obj.x += obj.movement.vector.x * obj.movement.speed * dt;
  obj.y += obj.movement.vector.y * obj.movement.speed * dt;
  this.c_.wallDis(obj);
  if (obj.c.wallDisN < 0) obj.y = obj.y -= obj.c.wallDisN;
  else if (obj.c.wallDisS < 0) obj.y = obj.y += obj.c.wallDisS;
  else if (obj.c.wallDisE < 0) obj.x = obj.x += obj.c.wallDisE;
  else if (obj.c.wallDisW < 0) obj.x = obj.x -= obj.c.wallDisW;
  if (obj.c.hitWall && obj.effect.dash) obj.utility.stopDash();
};
