var Game = di.service('Game', [
  'GameModel as gm', 'Mouse', 'Screen', 'Entity', 'EntityDecorator']);

Game.prototype.start = function() {
  this.startIntro_();
  this.startBattle_();
};

Game.prototype.startIntro_ = function() {
  var d = this.entityDecorator_;
  this.introEntities_ = this.gm_.entities = {};
  this.updateFn_ = this.updateIntro_;

  var splash = this.entity_.create('splash');
  this.introEntities_['splash'] = splash;

  var newGameBtn = this.entity_.create('btn');
  _.decorate(newGameBtn, d.shape.text, 'NEW GAME', function() {
    return Math.min(this.screen_.width / 16, this.screen_.height / 8);
  }.bind(this));
  _.decorate(newGameBtn, d.clickable);
  this.introEntities_['newGameBtn'] = newGameBtn;
};

Game.prototype.updateIntro_ = function() {
  this.gm_.entities['newGameBtn'].y = this.screen_.height / 4;
  if (this.gm_.entities['newGameBtn'].clicked) {
    this.startBattle_();
  }
};

Game.prototype.startBattle_ = function() {
  var d = this.entityDecorator_;
  this.battleEntities_ = this.gm_.entities = {};
  this.updateFn_ = this.updateBattle_;

  var player = this.entity_.create('ship');
  _.decorate(player, d.shape.circle, 10);
  _.decorate(player, d.movement.radial);
  player.style = 'good';
  player.speed = 135;
  this.battleEntities_['player'] = player;

  var enemy = this.entity_.create('ship');
  _.decorate(enemy, d.shape.circle, 10);
  _.decorate(enemy, d.movement.radial);
  enemy.speed = 100;
  this.battleEntities_['enemy'] = enemy;

  player.y = -this.screen_.height / 2 + 10;
  enemy.y = 0;

  player.target = enemy;
  enemy.target = player;
};

Game.prototype.updateBattle_ = function() {
};

Game.prototype.update = function(dt) {
  _.each(this.gm_.entities, function(e) { e.update(dt); });
  this.updateFn_(dt);
};
