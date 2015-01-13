var ShapeDecorators = di.service('ShapeDecorators', [
  'EntityDecorator', 'Font', 'Collision']);

ShapeDecorators.prototype.init = function() {
  this.entityDecorator_.addDecoratorObj(this, 'shape');
};

ShapeDecorators.prototype.decorateCircle_ = function(obj, spec) {
  spec = _.options(spec, {
    radius: 10
  });
  obj.radius = obj.collideDis = spec.radius;
  obj.collides = function(target) {
    var collisionFn;
    if (target.radius) collisionFn = this.collision_.circleCircle;
    else if (target.length) collisionFn = this.collision_.circleLine;
    else if (target.text) collisionFn = this.collision_.circleText;
    else if (target.x && target.y) collisionFn = this.collision_.circlePoint;
    else return false;
    return collisionFn.call(this.collision_, obj, target);
  }.bind(this);
};

ShapeDecorators.prototype.decorateLine_ = function(obj, spec) {
  spec = _.options(spec, {
    length: 20
  });
  obj.rotation = obj.rotation || 0;
  obj.length = obj.collideDis = spec.length;
  obj.collides = function(target) {
    var collisionFn;
    if (target.radius) collisionFn = this.collision_.lineCircle;
    else if (target.length) collisionFn = this.collision_.lineLine;
    else if (target.text) collisionFn = this.collision_.lineText;
    else if (target.x && target.y) collisionFn = this.collision_.linePoint;
    else return false;
    return collisionFn.call(this.collision_, obj, target);
  }.bind(this);

  obj.act(function(dt) {
    obj.dx = Math.cos(obj.rotation) * obj.length;
    obj.dy = Math.sin(obj.rotation) * obj.length;
  });
};

ShapeDecorators.prototype.decorateText_ = function(obj, spec) {
  spec = _.options(spec, {
    text: '',
    size: 10,
    align: 'center',
    baseline: 'middle'
  });
  obj.text = spec.text;
  obj.size = spec.size;
  obj.align = spec.align;
  obj.baseline = spec.baseline;
  obj.collides = function(target) {
    var collisionFn;
    if (target.radius) collisionFn = this.collision_.textCircle;
    else if (target.length) collisionFn = this.collision_.textLine;
    else if (target.text) collisionFn = this.collision_.textText;
    else if (target.x && target.y) collisionFn = this.collision_.textPoint;
    else return false;
    return collisionFn.call(this.collision_, obj, target);
  }.bind(this);

  obj.update(function(dt) {
    obj.size = _.valueOrFn(obj.size, dt);
  });
};
