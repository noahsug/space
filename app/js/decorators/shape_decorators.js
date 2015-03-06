var ShapeDecorators = di.service('ShapeDecorators', [
  'EntityDecorator', 'Font', 'Collision']);

ShapeDecorators.prototype.init = function() {
  this.entityDecorator_.addDecoratorObj(this, 'shape');
};

ShapeDecorators.prototype.decorateCircle_ = function(obj, spec) {
  spec = _.options(spec, {
    radius: 10
  });
  obj.setRadius = function(radius) {
    obj.radius = obj.collideDis = radius;
  };
  obj.setRadius(spec.radius);

  obj.collides = function(target) {
    var collisionFn;
    if (target.radius) collisionFn = this.collision_.circleCircle;
    else if (target.length) collisionFn = this.collision_.circleLine;
    else if (target.text) collisionFn = this.collision_.circleText;
    else if (target.width) collisionFn = this.collision_.circleRect;
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

  obj.rotate = function(angle) {
    obj.rotation += angle;
    obj.dx = Math.cos(obj.rotation) * obj.length;
    obj.dy = Math.sin(obj.rotation) * obj.length;
  };

  obj.collides = function(target) {
    var collisionFn;
    if (target.radius) collisionFn = this.collision_.lineCircle;
    else if (target.length) collisionFn = this.collision_.lineLine;
    else if (target.text) collisionFn = this.collision_.lineText;
    else if (target.width) collisionFn = this.collision_.lineRect;
    else if (target.x && target.y) collisionFn = this.collision_.linePoint;
    else return false;
    return collisionFn.call(this.collision_, obj, target);
  }.bind(this);

  obj.act(function(dt) {
    obj.rotate(0);  // Calc dx and dy.
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
    else if (target.width) collisionFn = this.collision_.textRect;
    else if (target.x && target.y) collisionFn = this.collision_.textPoint;
    else return false;
    return collisionFn.call(this.collision_, obj, target);
  }.bind(this);
};

ShapeDecorators.prototype.decorateRect_ = function(obj, spec) {
  spec = _.options(spec, {
    width: 0,
    height: 0
  });
  obj.width = spec.width;
  obj.height = spec.height;

  obj.setCenter = function(x, y) {
    obj.setPos(x - obj.width / 2, y - obj.height / 2);
  };

  obj.collides = function(target) {
    var collisionFn;
    if (target.radius) collisionFn = this.collision_.rectCircle;
    else if (target.length) collisionFn = this.collision_.rectLine;
    else if (target.text) collisionFn = this.collision_.rectText;
    else if (target.width) collisionFn = this.collision_.rectRect;
    else if (target.x && target.y) collisionFn = this.collision_.rectPoint;
    else return false;
    return collisionFn.call(this.collision_, obj, target);
  }.bind(this);
};
