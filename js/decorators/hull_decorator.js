var HullDecorator = di.service('HullDecorator', [
  'EntityDecorator', 'DecoratorUtil as util', 'ShipFactory', 'SpriteService']);

HullDecorator.prototype.init = function() {
  this.entityDecorator_.addDecoratorObj(this, 'hull');
};

HullDecorator.prototype.decorateBasic_ = function(obj, spec) {
  this.util_.spec(obj, 'hull', spec, {
    sprite: ''
  });
  obj.setRadius(this.spriteService_.getSize(obj.hull.sprite) / 2);
  if (obj.radius > 30) {
    this.util_.mod(obj, 'turnSpeed', .75);
  }
};
