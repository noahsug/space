var BackdropElement = di.factory('BackdropElement', [
  'EntityElement', 'GameModel as gm']);

BackdropElement.prototype.init = function() {
  _.class.extend(this, this.EntityElement_.new('backdrop'));
  this.gm_.entities.swapLatest();
};
