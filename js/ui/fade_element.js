var FadeElement = di.factory('FadeElement', [
  'EntityElement', 'GameModel as gm']);

FadeElement.ALPHA = 1;

FadeElement.prototype.init = function(from, to) {
  di.extend(this, this.EntityElement_, 'backdrop');
  this.set('baseAlpha', FadeElement.ALPHA);
};
