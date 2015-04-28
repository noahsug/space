var HullDecorator = di.service('HullDecorator', [
  'EntityDecorator', 'DecoratorUtil as util', 'ShipFactory']);

HullDecorator.prototype.init = function() {
  this.entityDecorator_.addDecoratorObj(this, 'hull');
};

HullDecorator.prototype.decorateBasic_ = function(obj, spec) {
  this.util_.spec(obj, 'hull', spec, {
    size: 0
  });
  obj.hull.style = _.findWhere(obj.dna, {category: 'hull'}).name;
  obj.setRadius(obj.hull.size / 2);
};
