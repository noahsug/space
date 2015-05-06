var AiMovement = di.service('AiMovement', [
  'EntityDecorator', 'Screen', 'DecoratorUtil as util', 'Random',
  'SharedComputation as c', 'GameModel as gm']);

AiMovement.prototype.init = function() {
  this.entityDecorator_.addDecorator(
      'movement', 'ai', this.aiMovement_.bind(this));
};

AiMovement.prototype.aiMovement_ = function(obj, spec) {
  this.util_.spec(obj, 'movement', spec, {
    speed: Speed.SHIP_SPEED,
    accel: Speed.SHIP_ACCEL,
    vector: {x: 0, y: 0},
    intelligence: .1,
    urgeCooldown: 1.5
  });

  this.util_.addCooldown(obj, function() {
    if (obj.dead) return 0;
    if (obj.effect.targetlessMovement) this.wander_(obj);
    else if (obj.movement.turret) obj.movement.desiredVector = {x: 0, y: 0};
    else this.think_(obj);
    var int = obj.movement.intelligence;
    return this.random_.nextFloat(int - .1, int + .1);
  }.bind(this));

  obj.update(function(dt) {
    if (obj.dead) return;
    this.updateVector_(obj, dt);
    this.move_(obj, dt);
  }.bind(this));
};

AiMovement.prototype.wander_ = function(obj) {
  if (Math.random() < .2 || !obj.movement.urge) {
    obj.movement.urge = {
      x: this.random_.nextInt(
        this.screen_.x - this.screen_.width / 2 + obj.radius,
        this.screen_.x + this.screen_.width / 2 - obj.radius),
      y: this.random_.nextInt(
        this.screen_.y - this.screen_.height / 2 + obj.radius,
        this.screen_.y + this.screen_.height / 2 - obj.radius)
    };
  }
  obj.movement.desiredVector = this.getRandomUrgeVector_(obj, 1);
  _.vector.cartesian(obj.movement.desiredVector);
};

AiMovement.prototype.think_ = function(obj) {
  //console.log('----- think ' + obj.style + ' -----');
  obj.movement.desiredDistance = this.getDesiredDistance_(obj) - 15;
  this.maybeUseDash_(obj);
  this.maybeUseTeleport_(obj);
  this.setDesiredVector_(obj);
  //console.log('result:', obj.movement.desiredVector);
};

AiMovement.prototype.getDesiredDistance_ = function(obj) {
  this.c_.rangeInfo_(obj);

  var maxDis = this.computeMaxDistance_(obj);
  if (!obj.movement.maxDis ||
      maxDis < obj.movement.maxDis ||
      obj.c.targetDis > obj.movement.maxDis + 100 ||
      maxDis > obj.movement.maxDis + 200 ||
      obj.movement.maxDisTime < this.gm_.time) {
    obj.movement.maxDis = maxDis;
    obj.movement.maxDisTime = this.gm_.time + 10;
  }

  var bestDistance = this.computeBestDistance_(obj);
  if (!bestDistance) {
    obj.movement.maxDis = Infinity;
    bestDistance = this.computeBestDistance_(obj);
  }

  return bestDistance || 1;
};

AiMovement.prototype.computeMaxDistance_ = function(obj) {
  var backAngle = obj.c.targetAngle + _.RADIANS_180;
  var backAngleX = Math.cos(backAngle);
  var xDis = (backAngleX < 0 ? obj.c.wallDisW : obj.c.wallDisE) /
      Math.abs(backAngleX);
  var backAngleY = Math.sin(backAngle);
  var yDis = (backAngleY < 0 ? obj.c.wallDisN : obj.c.wallDisS) /
      Math.abs(backAngleY);
  if (xDis > yDis) xDis = Math.hypot(yDis, obj.c.wallDisY);
  else yDis = Math.hypot(xDis, obj.c.wallDisX);
  var maxDis = _.distance({x: xDis, y: yDis});
  return Math.max(1, maxDis - maxDis % 50);
};

AiMovement.prototype.computeBestDistance_ = function(obj) {
  var targetIndex = 0;
  var numAttacks = 0;
  var bestNumAttacks = -Infinity;
  var bestDistance = undefined;

  for (var i = 0; i < obj.c.ranges.length; i++) {
    var self = Math.min(obj.c.ranges[i], obj.movement.maxDis);
    var target = obj.c.targetRanges[targetIndex] || 0;
    if (self > target) {
      // If have farthest attack + are out of target range, stay away.
      if (targetIndex == 0 && obj.c.targetDis > target) {
        return obj.c.ranges[i];
      }

      numAttacks++;
      if (numAttacks > bestNumAttacks) {
        bestNumAttacks = numAttacks;
        bestDistance = obj.c.ranges[i];
      }
    } else if (self < target) {
      numAttacks--;
      i--;
      targetIndex++;
    } else {
      while (obj.c.targetRanges[++targetIndex] == target) {
        numAttacks--;
      }
      while (obj.c.ranges[++i] == target) {
        numAttacks++;
      }
      i--;  // Will be incremented by for loop.
      if (numAttacks > bestNumAttacks) {
        bestNumAttacks = numAttacks;
        bestDistance = obj.c.ranges[i];
      }
    }
  }

  return bestDistance;
};

AiMovement.prototype.maybeUseDash_ = function(obj) {
  if (!obj.utility.dashReady) return;
  var dd = obj.c.targetDis - obj.movement.desiredDistance;
  if (Math.abs(dd) < 35) return;

  var dir = Math.sign(dd);
  var pos = {
    x: obj.x + Math.cos(obj.c.targetAngle) * 35 * dir,
    y: obj.y + Math.sin(obj.c.targetAngle) * 35 * dir,
    collideDis: obj.collideDis
  };
  this.c_.wallDis(pos);
  if (pos.c.hitWall) return;
  if (this.random_.next() < .15) obj.utility.useDash();
};

AiMovement.prototype.maybeUseTeleport_ = function(obj) {
  if (!obj.utility.teleportReady) return;
  var dd = obj.c.targetDis - obj.movement.desiredDistance;
  if (dd > 35 && this.random_.next() < .5) obj.utility.useTeleport();
  if (this.random_.next() < .1) obj.utility.useTeleport();
};

AiMovement.prototype.setDesiredVector_ = function(obj) {
  var v = {x: 0, y: 0};
  var total = 0;
  total += this.addAndGetLength_(v, this.getWallXVector_(obj, 4));
  total += this.addAndGetLength_(v, this.getWallYVector_(obj, 4));
  total += this.addAndGetLength_(v, this.getEnemyDistanceVector_(obj, 6));
  total += this.addAndGetLength_(v, this.getCloneDistanceVector_(obj, 2));
  total += this.addAndGetLength_(v, this.getDodgeVector_(obj, 2));
  total += this.addAndGetLength_(v, this.getFleeVector_(obj, 6));
  if (!obj.effect.invisible) {
    _.vector.add(v, this.getCurrentPerpendicularVector_(obj, 1.5));
    _.vector.add(v, this.getPerpendicularVector_(obj, .5, v));
  }

  var slowdown = Math.min(1, total / 6);
  _.vector.mult(_.vector.normalize(v), slowdown);
  obj.movement.desiredVector = v;
};

AiMovement.prototype.addAndGetLength_ = function(v, result) {
  var length = _.vector.length(result);
  _.vector.add(v, result);
  return Math.abs(length);
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
  if (!obj.movement.desiredDistance) return _.vector.EMPTY;
  var panic = 15;
  var dd = obj.c.targetDis - obj.movement.desiredDistance;
  var r = dd * dd / (panic * panic);
  // If we're a little too close or too far, don't panic.
  if (Math.abs(dd) < panic) weight *= r;
  var v = {length: weight * Math.sign(dd), angle: obj.c.targetAngle};
  //if (obj.style == 'bad') console.log('edis:', v,
  //                                     dd, obj.movement.desiredDistance);
  return v;
};

AiMovement.prototype.getCloneDistanceVector_ = function(obj, weight) {
  if (obj.clones.length == 1) return _.vector.EMPTY;
  var v = {x: 0, y: 0};
  for (var i = 0; i < obj.clones.length; i++) {
    var clone = obj.clones[i];
    if (clone === obj) continue;
    var distance = _.distance(obj, clone);
    var len = (1 - _.step(distance, 0, 50, 100, Infinity)) * weight;
    _.vector.add(v, {length: -len, angle: _.angle(obj, clone)});
  }
  //console.log('clone:', v);
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
    if (obj.utility.dashReady && this.random_.next() < .8) {
      obj.utility.useDash();
    } else if (obj.utility.teleportReady && this.random_.next() < .8) {
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
  if (!obj.movement.fleeing &&
      obj.c.wallDisY <= 25 &&
      obj.movement.maxDis <= 10 &&
      obj.c.targetDis <= 150 &&
      obj.primary.range > obj.target.primary.range) {
    // Wait 10 frames before fleeing.
    obj.movement.shouldFlee = obj.movement.shouldFlee || 10;
    obj.movement.shouldFlee--;
    if (obj.movement.shouldFlee == 0) {
      // Flee for 50 frames then give up.
      obj.movement.fleeing = 50;
      obj.movement.fleeDirection = obj.c.wallDisN > obj.c.wallDisS ?
        _.RADIANS_270 : _.RADIANS_90;
    }
  } else {
    obj.movement.shouldFlee = 0;
  }

  if (obj.movement.fleeing) obj.movement.fleeing--;
  if (!obj.movement.fleeing) return _.vector.EMPTY;

  var wallDis = obj.movement.fleeDirection == _.RADIANS_270 ?
        obj.c.wallDisN : obj.c.wallDisS;
  if (wallDis < 100) {
    obj.movement.fleeing = 0;
    return _.vector.EMPTY;
  }

  var v = {
    length: weight,
    angle: obj.movement.fleeDirection
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
  if (!PROD) _.assert(_.isDef(obj.movement.desiredVector.x));
  if (obj.effect.rooted) {
    return;
  }
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
  var m = obj.movement;
  // Move slower if no target or invisible.
  // TODO: Move this out of movement AI.
  var mod = 1;
  if (!obj.effect.displaced) {
    mod = obj.effect.invisible ? .5 : 1;
    mod = obj.effect.targetlessMovement ? .25 : 1;
  }

  obj.x += m.vector.x * m.speed * mod * dt;
  obj.y += m.vector.y * m.speed * mod * dt;
  this.c_.wallDis(obj);
  if (obj.c.wallDisN < 0) obj.y -= obj.c.wallDisN;
  else if (obj.c.wallDisS < 0) obj.y += obj.c.wallDisS;
  if (obj.c.wallDisE < 0) obj.x += obj.c.wallDisE;
  else if (obj.c.wallDisW < 0) obj.x -= obj.c.wallDisW;
};
