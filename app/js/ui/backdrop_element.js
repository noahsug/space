var BackdropElement = di.factory('BackdropElement', [
  'EntityElement', 'GameModel as gm']);

BackdropElement.prototype.init = function() {
  di.extend(this, this.EntityElement_, 'backdrop');
  this.gm_.entities.swapLatest();
};
