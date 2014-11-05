var BattleScene = di.service('BattleScene', [
  'GameModel as gm', 'Screen', 'Entity', 'EntityDecorator']);

BattleScene.prototype.init = function() {
  this.gm_.scenes['battle'] = 'inactive';
};

BattleScene.prototype.start = function() {
  this.gm_.scenes['battle'] = 'active';
  this.addEntities_();
};

BattleScene.prototype.addEntities_ = function() {
  var d = this.entityDecorator_;

  var player = this.entity_.create('ship');
  _.decorate(player, d.movement.radial, 135);
  _.decorate(player, d.shape.circle, 10);
  _.decorate(player, d.health, 25);
  _.decorate(player, d.weapon.laser);
  player.style = 'good';
  player.speed = 135;
  this.gm_.entities['player'] = player;

  var enemy = this.entity_.create('ship');
  _.decorate(enemy, d.movement.radial, 100);
  _.decorate(enemy, d.shape.circle, 10);
  _.decorate(enemy, d.health, 20);
  _.decorate(enemy, d.weapon.shotgun);
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
