var Decorator = di.service('Decorator', ['Mouse', 'Screen']);

Decorator.prototype.radius = function(e, radius) {
  e.decorate({
    name: 'radius',
    update: function() {
      e.radius = _.valueOrFn(radius);
    }
  });
};

Decorator.prototype.text = function(e, text, size) {
  e.decorate({
    name: 'text',
    update: function() {
      e.text = text;
      e.size = _.valueOrFn(size);
    }
  });
};

Decorator.prototype.clickable = function(e) {
  //var pos = this.screen_.translateMouse(this.mouse_.x, this.mouse_.y);
  //if (e.collides(pos.x, pos.y)) {
  //}
};
