var MovementDecorator = di.service('MovementDecorator', [
  'EntityDecorator', 'Random', 'SharedComputation', 'DecoratorUtil as util']);

MovementDecorator.prototype.init = function() {
  this.entityDecorator_.addDecoratorObj(this, 'movement');
};

//MovementDecorator.prototype.decorateRadial_ = function(obj, spec) {
//  this.util_.spec(obj, 'movement', spec, {
//    speed: 0
//  });
//
//  var target;
//  obj.act(function() {
//    target = {x: obj.target.x, y: obj.target.y};
//  });
//
//  obj.update(function(dt) {
//    if (obj.dead) return;
//    var currentAngle = _.angle(target, obj);
//    var dx = obj.x - target.x;
//    var dy = obj.y - target.y;
//    var radius = Math.hypot(Math.abs(dx), Math.abs(dy));
//    var circumference = Math.PI * radius * 2;
//    var arc = obj.movement.speed * dt;
//    var additionalAngle = Math.PI * 2 * (arc / circumference);
//    var nextAngle = currentAngle + additionalAngle;
//
//    obj.x += radius * Math.cos(nextAngle) - dx;
//    obj.y += radius * Math.sin(nextAngle) - dy;
//  });
//};

MovementDecorator.prototype.decorateStraight_ = function(obj, spec) {
  spec = this.util_.spec(obj, 'movement', spec, {
    speed: 0,
    accuracy: 0,
    dangle: 0,
    seek: 0,
    setAngle: false
  });

  var target;
  obj.awake(function() {
    if (spec.setAngle) {
      obj.rotation = spec.setAngle;
    } else {
      obj.rotation = this.getLeadAngle_(obj);
    }
    obj.rotation += spec.dangle;
    obj.accuracy = spec.accuracy / 2 - this.random_.next() * spec.accuracy;
    obj.rotation += obj.accuracy;
  }.bind(this));

  obj.act(function(dt) {
    if (!spec.seek) return;
    var desiredRotation = _.angle(obj, obj.target);
    var dr = desiredRotation - obj.rotation;
    if (Math.abs(dr) < spec.seek * dt) {
      obj.rotation = desiredRotation;
    } else {
      obj.rotation += spec.seek * dt * Math.sign(dr);
    }
  });

  obj.update(function(dt) {
    if (obj.dead) return;
    obj.x += Math.cos(obj.rotation) * spec.speed * dt;
    obj.y += Math.sin(obj.rotation) * spec.speed * dt;
  });
};

MovementDecorator.prototype.getLeadAngle_ = function(proj) {
  var target = this.getExpectedTargetPos_(proj);
  return _.angle(proj, target);
};

MovementDecorator.prototype.getExpectedTargetPos_ = function(proj) {
  if (!proj.target.movement) return proj.target;
  var leadRatio = .9;
  var targetSpeed =
        _.distance(proj.target.movement.vector) * proj.target.movement.speed;
  var aimPos = _.geometry.aimPosition(proj,
                                      proj.target,
                                      proj.target.movement.vector,
                                      targetSpeed,
                                      proj.movement.speed,
                                      proj.collideDis,
                                      leadRatio);
  aimPos.collideDis = proj.target.collideDis;
  this.sharedComputation_.wallDis(aimPos);
  //proj.target.aimPos = aimPos;  // DEBUG.
  if (aimPos.c.hitWall) {
    return proj.target;
  } else {
    return aimPos;
  }
};

MovementDecorator.prototype.decorateAtPosition_ = function(obj, spec) {
  this.util_.spec(obj, 'movement', spec, {
    target: {x: 0, y: 0}
  });

  obj.update(function(dt) {
    obj.x = obj.movement.target.x;
    obj.y = obj.movement.target.y;
  });
};
