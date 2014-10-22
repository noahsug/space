var Game = di.service('Game', [
  'GameModel as gm', 'Mouse', 'Screen', 'Entity', 'Decorator']);

Game.prototype.init = function() {
  var d = this.decorator_;

  var player = this.entity_.create('player');
  d.radius(player, 10);
  this.gm_.entities['player'] = player;

  var splash = this.entity_.create('splash');
  this.gm_.entities['splash'] = splash;

  var startBtn = this.entity_.create('btn');
  d.text(startBtn, 'start', function() {
    return Math.min(this.screen_.width / 4, this.screen_.height / 2) / 4;
  }.bind(this));
  d.clickable(startBtn);
  this.gm_.entities['startBtn'] = startBtn;
};

Game.prototype.update = function(dt) {
  var entities = this.gm_.entities;
  _.each(entities, function(e) { e.update(dt); });
  entities['startBtn'].setPos(0, this.screen_.height / 6);
};
