var Collision = di.service('Collision', ['TextService']);

Collision.Shapes = {
  circle: 0,
  line: 1,
  text: 2,
  point: 3
};

Collision.prototype.init = function(a, b) {
  this.createSwappedFns_();
};

// E.g. lineCircle from circleLine.
Collision.prototype.createSwappedFns_ = function(name) {
  _.each(_.functions(this), function(name) {
    var shapes = _.splitOnCaps(name);
    if (shapes.length != 2) return;
    var shape1 = _.uncapitalize(shapes[1]);
    var shape2 = _.capitalize(shapes[0]);
    if (shape1 == shape2.toLowerCase()) return;
    if (!(shape1 in Collision.Shapes)) return;
    if (!(shape2.toLowerCase() in Collision.Shapes)) return;
    this[shape1 + shape2] = function(a, b) {
      return this[name](b, a);
    };
  }, this);
};

// Circle collisions.
Collision.prototype.circlePoint = function(a, b) {
  var d2 = (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y);
  return d2 <= (a.radius) * (a.radius);
};

Collision.prototype.circleCircle = function(a, b) {
  var d2 = (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y);
  return d2 <= (a.radius + b.radius) * (a.radius + b.radius);
};

Collision.prototype.circleLine = function(a, b) {
  var cx = a.x - b.x;
  var cy = a.y - b.y;
  var r2 = a.radius * a.radius;
  var len2 = b.length * b.length;
  return (cy * b.dx - cx * b.dy) * (cy * b.dx - cx * b.dy) <= r2 * len2 && (
      cx * cx + cy * cy <= r2 ||
      (b.dx - cx) * (b.dx - cx) + (b.dy - cy) * (b.dy - cy) <= r2 ||
      cx * b.dx + cy * b.dy >= 0 && cx * b.dx + cy * b.dy <= len2);
};

Collision.prototype.circleRect = _.unimplemented;

Collision.prototype.circleText = _.unimplemented;

// Text collisions.
var rect = {};
Collision.prototype.textPoint = function(a, b) {
  rect.width = this.font_.width(a.text, a.size);
  rect.height = a.size;
  if (a.align == 'center') {
    rect.x = a.x - rect.width / 2;
  } else if (a.align == 'right') {
    rect.x = a.x - rect.width;
  } else if (a.align == 'left') {
    rect.x = a.x;
  } else {
    _.fail('text align not supported: ' + a.align);
  }
  if (a.baseline == 'middle') {
    rect.y = a.y - rect.height / 2;
  } else if (a.baseline == 'bottom') {
    rect.y = a.y - rect.height;
  } else if (a.baseline == 'top') {
    rect.y = a.y;
  } else {
    _.fail('text baseline not supported: ' + a.baseline);
  }
  return this.rectPoint(rect, b);
};

Collision.prototype.textLine = _.unimplemented;

Collision.prototype.textRect = _.unimplemented;

Collision.prototype.textText = _.unimplemented;

// Rect collisions.
Collision.prototype.rectPoint = function(a, b) {
  return b.y > a.y && b.y < a.y + a.height &&
      b.x > a.x && b.x < a.x + a.width;
};

Collision.prototype.rectRect = _.unimplemented;

Collision.prototype.rectLine = _.unimplemented;

// Line collisions.
Collision.prototype.lineLine = _.unimplemented;

Collision.prototype.linePoint = _.unimplemented;

// Point collisions.
Collision.prototype.pointPoint = _.unimplemented;
