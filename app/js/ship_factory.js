var ShipFactory = di.service('ShipFactory', [
  'GameModel as gm', 'Entity', 'EntityDecorator as ed', 'gameplay', 'Screen',
  'ShipDecorator']);

ShipFactory.prototype.createPlayer = function() {
  var player = this.entity_.create('ship');
  _.decorate(player, this.shipDecorator_);
  this.ed_.decorate(player, this.gm_.player);
  player.style = 'good';
  this.gm_.entities.add(player, 'player');
  player.x = this.screen_.x;
  player.y = this.screen_.y + 100;
  return player;
};

ShipFactory.prototype.createRandomShip = function(level) {
  _.fail('implement this!');
};

ShipFactory.prototype.createBoss = function(level) {
  var spec = this.gameplay_.bosses[level];
  return this.createEnemy_(spec);
};

ShipFactory.prototype.createEnemy_ = function(spec) {
  var enemy = this.entity_.create('ship');
  _.decorate(enemy, this.shipDecorator_);
  this.ed_.decorate(enemy, spec);
  enemy.style = 'bad';
  this.gm_.entities.add(enemy, 'enemy');
  enemy.x = this.screen_.x;
  enemy.y = this.screen_.y - 100;
  return enemy;
};

ShipFactory.prototype.setTargets = function(e1, e2) {
  e1.target = e2;
  e2.target = e1;
};
