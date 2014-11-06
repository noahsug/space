var BattleScene = di.service('BattleScene', [
  'GameModel as gm', 'Screen', 'Entity', 'EntityDecorator', 'gameplay']);

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
  ed.decorate(player, this.gm_.player.specs);
  player.style = 'good';
  this.gm_.entities['player'] = player;

  var enemy = this.entity_.create('ship');
  ed.decorate(enemy, this.gameplay_.init.enemy);
  this.gm_.entities['enemy'] = enemy;

  player.y = 100;
  enemy.y = -100;

  player.target = enemy;
  enemy.target = player;
};

BattleScene.prototype.update = function() {
  if (this.gm_.scenes['battle'] != 'active') return;
  var player = this.gm_.entities['player'];
  var enemy = this.gm_.entities['enemy'];
  if (player.dead || enemy.dead) {
    this.gm_.scenes['battle'] = 'inactive';
    this.gm_.scenes['intro'] = 'start';
  }
};

BattleScene.prototype.resolve = function(dt) {
  if (this.gm_.scenes['battle'] == 'start') {
    this.start();
  }
};
