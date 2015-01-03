var MovementDecorators = di.service('MovementDecorators', [
  'EntityDecorator', 'Random', 'SharedComputation']);

MovementDecorators.prototype.init = function() {
  this.entityDecorator_.addDecoratorObj(this, 'movement');
};

MovementDecorators.prototype.decorateRadial_ = function(obj, spec) {
  obj.movement = _.options(spec, {
    speed: 0
  });

  var target;
  obj.act(function() {
    target = {x: obj.target.x, y: obj.target.y};
  });

  obj.update(function(dt) {
    if (obj.effect.stunned) return;
    if (obj.dead) return;
    var currentAngle = _.angle(target, obj);
    var dx = obj.x - target.x;
    var dy = obj.y - target.y;
    var radius = Math.hypot(Math.abs(dx), Math.abs(dy));
    var circumference = Math.PI * radius * 2;
    var arc = obj.movement.speed * dt;
    var additionalAngle = Math.PI * 2 * (arc / circumference);
    var nextAngle = currentAngle + additionalAngle;

    obj.x += radius * Math.cos(nextAngle) - dx;
    obj.y += radius * Math.sin(nextAngle) - dy;
  });
};

MovementDecorators.prototype.decorateStraight_ = function(obj, spec) {
  obj.movement = _.options(spec, {
    speed: 0,
    accuracy: 0,
    dangle: 0,
    seek: 0,
    leadTarget: true
  });

  var target;
  obj.awake(function() {
    var target = obj.movement.leadTarget ?
        getExpectedTargetPos(obj) : obj.target;
    obj.rotation = _.angle(obj, target);
    var a = this.random_.next() * obj.movement.accuracy;
    obj.rotation += obj.movement.accuracy / 2 - a;
    obj.rotation += obj.movement.dangle;
  }.bind(this));

  obj.act(function(dt) {
    if (!obj.movement.seek) return;
    var desiredRotation = _.angle(obj, obj.target);
    var dr = desiredRotation - obj.rotation;
    if (Math.abs(dr) < obj.movement.seek * dt) {
      obj.rotation = desiredRotation;
    } else {
      obj.rotation += obj.movement.seek * dt * Math.sign(dr);
    }
  });

  obj.update(function(dt) {
    if (obj.dead) return;
    obj.x += Math.cos(obj.rotation) * obj.movement.speed * dt;
    obj.y += Math.sin(obj.rotation) * obj.movement.speed * dt;
  });

  var getExpectedTargetPos = function(obj) {
    var leadRatio = 1;  //this.random_.next();
    var aimPos = _.geometry.aimPosition(obj,
                                        obj.target,
                                        obj.target.movement.vector,
                                        obj.target.movement.speed,
                                        obj.movement.speed,
                                        obj.collideDis,
                                        leadRatio);
    aimPos.collideDis = obj.target.collideDis;
    this.sharedComputation_.wallDis(aimPos);
    //obj.target.aimPos = aimPos;  // DEBUG.
    if (aimPos.c.hitWall) {
      return obj.target;
    } else {
      return aimPos;
    }
  }.bind(this);
};
