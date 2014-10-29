var EntityDecorator = di.service('EntityDecorator',
    ['Mouse', 'Screen', 'Font']);

EntityDecorator.prototype.init = function() {
  this.clickable = {name: 'clickable',
                    decorate: this.decorateClickable_.bind(this)};
  this.movement = {
    radial: {name: 'movement.radial',
             decorate: this.decorateRadialMovement_.bind(this)}
  };
  this.shape = {
    circle: {name: 'shape.circle', decorate: this.decorateCircle_.bind(this)},
    text: {name: 'shape.text', decorate: this.decorateText_.bind(this)}
  };
};

EntityDecorator.prototype.decorateClickable_ = function(obj) {
  obj.update(function() {
    obj.mouseOver = obj.collides(this.mouse_.x, this.mouse_.y);
    obj.clicked = obj.mouseOver && this.mouse_.pressed;
  }.bind(this));
};

EntityDecorator.prototype.decorateCircle_ = function(obj, radius) {
  obj.update(function(dt) {
    obj.radius = _.valueOrFn(radius, dt);
    obj.collides = function(x, y) {
      var distance = Math.hypot(Math.abs(obj.x - x), Math.abs(obj.y - y));
      return distance < obj.radius;
    };
  });
};

EntityDecorator.prototype.decorateText_ = function(obj, text, size) {
  obj.text = text;
  obj.update(function(dt) {
    obj.size = _.valueOrFn(size, dt);
  });
  obj.collides = function(x, y) {
    if (Math.abs(y - obj.y) > obj.size / 2) {
      return false;
    }
    var width = this.font_.width(text, obj.size);
    return Math.abs(x - obj.x) < width / 2;
  }.bind(this);
};

EntityDecorator.prototype.decorateRadialMovement_ = function(obj) {
  obj.update(function(dt) {
    var dx = obj.x - obj.target.x;
    var dy = obj.y - obj.target.y;
    var currentAngle = Math.atan(dy / dx) + Math.PI * 2;
    if (dx < 0) {
      currentAngle += Math.PI;
    }

    var radius = Math.hypot(Math.abs(dx), Math.abs(dy));
    var circumference = Math.PI * radius * 2;
    var arc = obj.speed * dt;
    var additionalAngle = Math.PI * 2 * (arc / circumference);
    var nextAngle = currentAngle + additionalAngle;

    obj.x += radius * Math.cos(nextAngle) - dx;
    obj.y += radius * Math.sin(nextAngle) - dy;
  });
};
