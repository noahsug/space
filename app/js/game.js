var Game = di.service('Game', [
  'GameModel as gm', 'Mouse', 'Screen', 'Entity', 'EntityDecorator']);

Game.UPDATE_RATE = .06;

Game.prototype.start = function() {
  this.nextAction_ = 0;
  this.startIntro_();
  this.startBattle_();
};

Game.prototype.startIntro_ = function() {
  var d = this.entityDecorator_;
  this.gm_.entities = this.introEntities_ = {};
  this.gm_.scenes = {'intro': 1};
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
  this.gm_.entities = this.battleEntities_ = {};
  this.gm_.scenes = {'battle': 1};
  this.updateFn_ = this.updateBattle_;
  this.nextAction_ = 0;

  var player = this.entity_.create('ship');
  _.decorate(player, d.movement.radial, 135);
  _.decorate(player, d.shape.circle, 10);
  _.decorate(player, d.health, 25);
  _.decorate(player, d.weapon.laser);
  player.style = 'good';
  player.speed = 135;
  this.battleEntities_['player'] = player;

  var enemy = this.entity_.create('ship');
  _.decorate(enemy, d.movement.radial, 100);
  _.decorate(enemy, d.shape.circle, 10);
  _.decorate(enemy, d.health, 20);
  _.decorate(enemy, d.weapon.shotgun);
  this.battleEntities_['enemy'] = enemy;

  player.y = 100;
  enemy.y = -100;

  player.target = enemy;
  enemy.target = player;
};

Game.prototype.updateBattle_ = function() {
};

Game.prototype.update = function(dt) {
  this.updateEntities_(dt);
  this.updateFn_(dt);
};

Game.prototype.updateEntities_ = function(dt) {
  var updateTime = Math.min(dt, this.nextAction_);
  if (updateTime > 0) {
    _.each(this.gm_.entities, function(e) { e.update(updateTime); });
    dt -= updateTime;
    this.nextAction_ -= updateTime;
  }
  if (this.nextAction_ == 0) {
    this.entityAction_(Game.UPDATE_RATE);
    this.nextAction_ = Game.UPDATE_RATE;
  }
  if (dt > 0) {
    this.updateEntities_(dt);
  }
};

Game.prototype.entityAction_ = function(dt) {
  _.each(this.gm_.entities, function(e) { e.act(dt); });
  _.each(this.gm_.entities, function(e) { e.affect(dt); });
  _.each(this.gm_.entities, function(e) { e.resolve(dt); });
};
