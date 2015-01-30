var ShipFactory = di.service('ShipFactory', [
  'GameModel as gm', 'Entity', 'EntityDecorator as ed', 'Gameplay', 'Screen',
  'ShipDecorator', 'ItemService']);

ShipFactory.prototype.createPlayer = function() {
  return this.createShip_(this.gm_.player, 'good', this.playerStats);
};

ShipFactory.prototype.createRandomShip = function(level) {
  var primary = _.sample(this.itemService_.getByTypeAndLevel(
      'primary', this.getLevel_(level)));
  var secondary = _.sample(this.itemService_.getByTypeAndLevel(
      'secondary', this.getLevel_(level)));
  var utility = _.sample(this.itemService_.getByTypeAndLevel(
      'utility', this.getLevel_(level)));
  var ability = _.sample(this.itemService_.getByTypeAndLevel(
      'ability', this.getLevel_(level)));
  var mod = _.sample(this.itemService_.getByTypeAndLevel(
      'mod', this.getLevel_(level)));
  var circle = this.itemService_.getByName('circle');

  var spec = [primary, circle];
  var chance = .05 + .7 * level / Game.NUM_LEVELS;
  if (Math.random() < chance) spec.push(secondary);
  if (Math.random() < chance) spec.push(ability);
  if (Math.random() < chance) spec.push(utility);
  if (Math.random() < chance) spec.push(mod);
  return this.createEnemy_(spec);
};

ShipFactory.prototype.getLevel_ = function(level) {
  var r = Math.random();
  if (level && r < .52) level--;
  if (level && r < .25) level--;
  if (level && r < .11) level--;
  return level;
};

ShipFactory.prototype.createBoss = function(level) {
  var spec = this.gameplay_.bosses[level];
  return this.createEnemy_(spec);
};

ShipFactory.prototype.createEnemy_ = function(spec) {
  return this.createShip_(spec, 'bad');
};

ShipFactory.prototype.createShip_ = function(spec, style, opt_stats) {
  var ship = this.entity_.create('ship');
  _.decorate(ship, this.shipDecorator_, opt_stats);
  this.ed_.decorate(ship, spec);
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
