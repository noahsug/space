var AiMovement = di.service('AiMovement', [
  'EntityDecorator', 'Screen', 'DecoratorUtil as util', 'Random']);

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
    distance: 200
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
  console.log('----- think -----');
  this.setDesiredVector_(obj);
  console.log('result:', obj.movement.desiredVector);
};

AiMovement.prototype.setDesiredVector_ = function(obj) {
  var c = this.getCommonVectorCalculations_(obj);
  var v = this.getWallXVector_(obj, c);
  _.vector.add(v, this.getWallYVector_(obj, c));
  _.vector.add(v, this.getCenterVector_(obj, c));
  _.vector.add(v, this.getEnemyDistanceVector_(obj, c));
  _.vector.add(v, this.getCurrentPerpendicularVector_(obj, c));
  _.vector.add(v, this.getPerpendicularVector_(obj, v, c));
  _.vector.normalize(v);
  obj.movement.desiredVector = v;
};

AiMovement.prototype.getCommonVectorCalculations_ = function(obj) {
  var c = {};
  // Angle to target.
  c.ta = _.angle(obj, obj.target);
  return c;
};

AiMovement.prototype.getWallXVector_ = function(obj) {
  var dx = obj.x - this.screen_.x;
  var wallDis = this.screen_.width / 2 - Math.abs(dx);
  var v = {
    length: this.getWallVectorLength_(wallDis),
    angle: dx < 0 ? 0 : _.RADIANS_180};
  console.log('wallx:', v);
  return v;
};

AiMovement.prototype.getWallYVector_ = function(obj) {
  var dy = obj.y - this.screen_.y;
  var wallDis = this.screen_.height / 2 - Math.abs(dy);
  var v = {
    length: this.getWallVectorLength_(wallDis - obj.radius),
    angle: dy < 0 ? _.RADIANS_90 : -_.RADIANS_90
  };
  console.log('wally:', v);
  return v;
};

AiMovement.prototype.getWallVectorLength_ = function(distance) {
  var len = 75 - Math.min(distance, 75);
  return (len * len * len) / 800;
};

AiMovement.prototype.getCenterVector_ = function(obj) {
  var a = _.angle(obj, this.screen_);
  if (isNaN(a)) return _.vector.EMPTY;
  var v = {length: 2, angle: a};
  console.log('center:', v);
  return v;
};

AiMovement.prototype.getEnemyDistanceVector_ = function(obj, c) {
  var d = _.distance(obj, obj.target);
  var dd = d - obj.movement.distance;
  if (dd < 0) dd *= 2;
  var v = {length: dd / 20, angle: c.ta};
  console.log('edis:', v);
  return v;
};

AiMovement.prototype.getCurrentPerpendicularVector_ = function(obj, c) {
  if (_.vector.isEmpty(obj.movement.vector)) return _.vector.EMPTY;
  var a = _.angle(obj.movement.vector);
  var da = a - c.ta;
  if (da < 0) da += _.RADIANS_360;
  var pa = c.ta + _.RADIANS_90 * (da < _.RADIANS_180 ? 1 : -1);
  var v = {
    length: Math.abs(Math.cos(da)) * 20,
    angle: pa
  };
  console.log('cperp:', v);
  return v;
};

AiMovement.prototype.getPerpendicularVector_ = function(obj, mv, c) {
  var pa = this.getClosestPerpAngle_(c.ta, _.angle(mv));
  var v = {length: 5, angle: pa};
  console.log('perp:', v);
  return v;
};

AiMovement.prototype.getClosestPerpAngle_ = function(perpTo, closeTo) {
  var da = closeTo - perpTo;
  if (da < 0) da += _.RADIANS_360;
  return perpTo + _.RADIANS_90 * (da < _.RADIANS_180 ? 1 : -1);
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
