var BackdropElement = di.factory('BackdropElement', [
  'EntityElement', 'GameModel as gm']);

BackdropElement.ALPHA = .65;

BackdropElement.prototype.init = function() {
  di.extend(this, this.EntityElement_, 'backdrop');
  this.gm_.entities.swapLatest();
  this.setBaseAlpha(BackdropElement.ALPHA);
};

BackdropElement.prototype.setBaseAlpha = function(baseAlpha) {
  this.setProp('baseAlpha', baseAlpha);
  return this;
};
