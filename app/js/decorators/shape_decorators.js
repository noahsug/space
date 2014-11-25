var ShapeDecorators = di.service('ShapeDecorators', [
  'EntityDecorator', 'Font']);

ShapeDecorators.prototype.init = function() {
  this.entityDecorator_.addDecoratorObj(this, 'shape');
};

ShapeDecorators.prototype.decorateCircle_ = function(obj, spec) {
  spec = _.options(spec, {
    radius: 10
  });
  obj.radius = spec.radius;
  obj.collides = function(x, y) {
    var distance = Math.hypot(Math.abs(obj.x - x), Math.abs(obj.y - y));
    return distance < obj.radius;
  };
};


/**
 * @requires {obj.rotation}
 */
ShapeDecorators.prototype.decorateLine_ = function(obj, spec) {
  spec = _.options(spec, {
    length: 1
  });
  obj.length = spec.length;
  obj.collidePoints = [];
  obj.act(function(dt) {
    obj.dx = Math.cos(obj.rotation) * obj.length;
    obj.dy = Math.sin(obj.rotation) * obj.length;
    obj.collidePoints = [{x: obj.x, y: obj.y},
                         {x: obj.x - obj.dx, y: obj.y - obj.dy}];
    if (obj.length > 7) {
      obj.collidePoints.push({x: obj.x - obj.dx / 2, y: obj.y - obj.dy / 2});
    }
    if (obj.speed && obj.speed * .02 - obj.length > 5) {
      var dx2 = (Math.cos(obj.rotation) * obj.speed * dt - obj.dx) / 2;
      var dy2 = (Math.sin(obj.rotation) * obj.speed * dt - obj.dy) / 2;
      obj.collidePoints.push({x: obj.x + dx2, y: obj.y + dy2});
    }
  });
};

ShapeDecorators.prototype.decorateText_ = function(obj, spec) {
  spec = _.options(spec, {
    text: '',
    size: 10
  });
  obj.text = spec.text;
  obj.size = _.valueOrFn(spec.size);

  obj.collides = function(x, y) {
    if (Math.abs(y - obj.y) > obj.size / 2) {
      return false;
    }
    var width = this.font_.width(spec.text, obj.size);
    return Math.abs(x - obj.x) < width / 2;
  }.bind(this);

  obj.update(function(dt) {
    obj.size = _.valueOrFn(spec.size, dt);
  });
};
