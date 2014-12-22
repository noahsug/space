var MovementDecorators = di.service('MovementDecorators', [
  'EntityDecorator', 'Random']);

MovementDecorators.prototype.init = function() {
  this.entityDecorator_.addDecoratorObj(this, 'movement');
};

MovementDecorators.prototype.decorateRadial_ = function(obj, spec) {
  spec = _.options(spec, {
    speed: 0
  });
  obj.speed = spec.speed;

  var target;
  obj.act(function() {
    target = {x: obj.target.x, y: obj.target.y};
  });

  obj.update(function(dt) {
    if (obj.effects.stunned.value) return;
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

MovementDecorators.prototype.decorateStraight_ = function(obj, spec) {
  spec = _.options(spec, {
    speed: 0,
    accuracy: 0,
    dangle: 0,
    seek: 0
  });
  obj.speed = spec.speed;

  var target;
  obj.awake(function() {
    obj.rotation = _.angle(obj.x, obj.y, obj.target.x, obj.target.y);
    var a = this.random_.next() * spec.accuracy;
    obj.rotation += a - a / 2;
    obj.rotation += spec.dangle;
  }.bind(this));

  obj.act(function(dt) {
    var desiredRotation = _.angle(obj.x, obj.y, obj.target.x, obj.target.y);
    var dr = desiredRotation - obj.rotation;
    if (Math.abs(dr) < spec.seek * dt) {
      obj.rotation = desiredRotation;
    } else {
      obj.rotation += spec.seek * dt * Math.sign(dr);
    }
  });

  obj.update(function(dt) {
    if (obj.dead) return;
    obj.x += Math.cos(obj.rotation) * obj.speed * dt;
    obj.y += Math.sin(obj.rotation) * obj.speed * dt;
  });
};
