var BattleScene = di.service('BattleScene', [
  'GameModel as gm', 'Screen', 'Entity', 'EntityDecorator', 'gameplay']);

var TRANSITION_TIME = 1.2;

BattleScene.prototype.init = function() {
  this.gm_.scenes['battle'] = 'inactive';
};

BattleScene.prototype.start = function() {
  this.gm_.scenes['battle'] = 'active';
  this.addEntities_();
};

BattleScene.prototype.addEntities_ = function() {
  var ed = this.entityDecorator_;

  var player = this.entity_.create('ship');
  ed.decorate(player, this.gm_.player.spec);
  player.style = 'good';
  this.gm_.entities['player'] = player;

  var enemy = this.entity_.create('ship');
  ed.decorate(enemy, this.gameplay_.init.enemy);
  enemy.style = 'bad';
  this.gm_.entities['enemy'] = enemy;

  player.y = this.screen_.y + 100;
  player.x = this.screen_.x;
  enemy.y = this.screen_.y - 100;
  enemy.x = this.screen_.x;

  player.target = enemy;
  enemy.target = player;
};

BattleScene.prototype.pauseEntities_ = function() {
  var d = this.entityDecorator_.getDecorators();
  _.each(this.gm_.entities, function(e) {
    _.decorate(e, d.slowToFreeze, {duration: 1.15});
  });
};

BattleScene.prototype.removeEntities_ = function() {
  this.gm_.entities = {};
};

BattleScene.prototype.update = function(dt) {
  if (this.gm_.scenes['battle'] == 'active') {
    var player = this.gm_.entities['player'];
    var enemy = this.gm_.entities['enemy'];
    if (player.dead || enemy.dead) {
      this.gm_.scenes['battle'] = 'transition';
      this.transitionTime_ = TRANSITION_TIME;
      this.pauseEntities_();
    }
  } else if (this.gm_.scenes['battle'] == 'transition') {
    this.transitionTime_ -= dt;
    if (this.transitionTime_ <= 0) {
      this.gm_.scenes['battle'] = 'transitionOver';
    }
  } else if (this.gm_.scenes['battle'] == 'transitionOver') {
    this.gm_.scenes['battle'] = 'inactive';
    this.removeEntities_();
    this.gm_.scenes['equip'] = 'start';
  }
};

BattleScene.prototype.resolve = function(dt) {
  if (this.gm_.scenes['battle'] == 'start') {
    this.start();
  }
};
