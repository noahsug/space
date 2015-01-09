var BtnLarge = di.service('BtnLarge', [
  'Entity', 'EntityDecorator', 'GameModel as gm', 'Screen']);

BtnLarge.prototype.init = function(name) {
  this.d_ = this.entityDecorator_.getDecorators();
  this.onClick_ = _.EMPTY_FN;

  this.base = this.entity_.create('btnSm');
  this.base.name = name;
  _.decorate(this.base, this.d_.shape.circle, {radius: 20});
  _.decorate(this.base, this.d_.clickable);
  _.decorate(this.base, this.d_.staticPosition);
  this.gm_.entities.add(this.base);

  //this.updateSize_();
  this.setPos = this.base.setPos.bind(this.base);
};
