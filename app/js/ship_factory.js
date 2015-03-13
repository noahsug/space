var ShipFactory = di.service('ShipFactory', [
  'GameModel as gm', 'Entity', 'EntityDecorator as ed', 'Gameplay', 'Screen',
  'ShipDecorator', 'ItemService']);

ShipFactory.prototype.createEnemyDna = function(level) {
  //return this.gameplay_.bosses[level];
  return this.createRandomDna_(level);
};

var MAX_ITEM_LEVEL = 2;
ShipFactory.prototype.createRandomDna_ = function(level) {
  level = Math.round(MAX_ITEM_LEVEL * level / Game.MAX_LEVEL);
  var primary = _.sample(this.itemService_.getByTypeAndLevel(
      'primary', this.getLevel_(level)));
  var secondary = _.sample(this.itemService_.getByTypeAndLevel(
      'secondary', this.getLevel_(level)));
  var utility = _.sample(this.itemService_.getByTypeAndLevel(
      'utility', this.getLevel_(level)));
  var ability = _.sample(this.itemService_.getByTypeAndLevel(
      'ability', this.getLevel_(level)));

  var dna = [primary];
  var chance = .05 + .7 * level / MAX_ITEM_LEVEL;
  if (Math.random() < chance) dna.push(secondary);
  if (Math.random() < chance) dna.push(ability);
  if (Math.random() < chance) dna.push(utility);
  return dna;
};

ShipFactory.prototype.getLevel_ = function(level) {
  var r = Math.random();
  if (level && r < .52) level--;
  if (level && r < .25) level--;
  if (level && r < .11) level--;
  return level;
};

ShipFactory.prototype.createEnemy = function() {
  return this.createShip_(this.gm_.level.enemy, 'bad');
};

ShipFactory.prototype.createPlayer = function() {
  return this.createShip_(this.gm_.player, 'good');
};

ShipFactory.prototype.createShip_ = function(dna, style) {
  var ship = this.entity_.create('ship');
  ship.dna = dna;
  _.decorate(ship, this.shipDecorator_);
  this.ed_.decorate(ship, dna);
  ship.style = style;
  this.gm_.entities.add(ship);
  ship.x = this.screen_.x;
  ship.y = this.screen_.y + (style == 'good' ? 100 : -100);
  return ship;
};

ShipFactory.prototype.setTargets = function(e1, e2) {
  e1.target = e2;
  e2.target = e1;
};
