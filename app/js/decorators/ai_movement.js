var AiMovement = di.service('AiMovement', [
  'EntityDecorator', 'Screen', 'DecoratorUtil as util']);

AiMovement.prototype.init = function() {
  this.entityDecorator_.addDecorator(
      'movement', 'ai', this.aiMovement_.bind(this));
};

AiMovement.prototype.aiMovement_ = function(obj, spec) {
  obj.movement = _.options(spec, {
    speed: 0,
    accel: 2,
    vector: {x: 0, y: 0},
    intelligence: .25
  });

  this.util_.onCooldown(obj, function() {
    if (obj.dead) return 0;
    this.think_(obj);
    return obj.movement.intelligence;
  }.bind(this));

  obj.update(function(dt) {
    if (obj.dead) return;
    this.updateVector_(obj, dt);
    this.move_(obj, dt);
  }.bind(this));
};

AiMovement.prototype.think_ = function(obj, dt) {
  this.setDesiredVector_(obj);
};

AiMovement.prototype.setDesiredVector_ = function(obj) {
  var c = this.getCommonVectorCalculations_(obj);
  var v = this.getWallXVector_(obj, c);
  //v = this.addVector_(v, this.getWallYVector_(obj, c));
  v = this.addVector_(v, this.getEnemyDistanceVector_(obj, c));
  //v = this.addVector_(v, this.getCurrentPerpendicularVector_(obj, c));
  //v = this.addVector_(v, this.getPerpendicularVector_(obj, v, c));
  obj.movement.desiredVector = this.normalizeVector_(v);
  _.vector.cartesian(obj.movement.desiredVector);
};

AiMovement.prototype.getCommonVectorCalculations_ = function(obj) {
  var c = {};
  c.a = _.angle(obj, obj.target);
  return c;
};

AiMovement.prototype.getWallXVector_ = function(obj, c) {
  return {};
};

AiMovement.prototype.getWallYVector_ = function(obj, c) {
  return {};
};

AiMovement.prototype.getEnemyDistanceVector_ = function(obj, c) {
  var d = _.distance(obj, obj.target);
  var dd = d - 100;
  if (dd < 0) dd *= dd;
  return {angle: c.a, length: dd};
};

AiMovement.prototype.getCurrentPerpendicularVector_ = function(obj, c) {
  return {};
};

AiMovement.prototype.getPerpendicularVector_ = function(obj, v, c) {
  return {};
};

AiMovement.prototype.addVector_ = function(v1, v2) {
  return v2;
};

AiMovement.prototype.normalizeVector_ = function(v) {
  v.length = Math.sign(v.length);
  return v;
};

AiMovement.prototype.updateVector_ = function(obj, dt) {
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
  obj.x += obj.movement.vector.x * obj.movement.speed * dt;
  obj.y += obj.movement.vector.y * obj.movement.speed * dt;
};
