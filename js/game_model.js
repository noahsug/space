var GameModel = di.service('GameModel');

GameModel.prototype.init = function() {
  this.entities = {};
  this.rep = {};
  this.scenes = {};
  this.player = {};
};

GameModel.rep = function(gm, name) {
  return gm.rep[name] = gm.rep[name] + 1 || 0;
};
