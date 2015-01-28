var ShipFactory = di.service('ShipFactory', [
  'GameModel as gm', 'Entity', 'EntityDecorator as ed', 'Gameplay', 'Screen',
  'ShipDecorator', 'ItemService']);

ShipFactory.prototype.createPlayer = function() {
  return this.createShip_(this.gm_.player, 'good', this.playerStats);
};

ShipFactory.prototype.createRandomShip = function(level) {
  var primary = _.sample(this.itemService_.getByType('primary'));
  var secondary = _.sample(this.itemService_.getByType('secondary'));
  var utility = _.sample(this.itemService_.getByType('utility'));
  var ability = _.sample(this.itemService_.getByType('ability'));
  var mod = _.sample(this.itemService_.getByType('mod'));
  var circle = this.itemService_.getByName('circle');

  var spec = [primary, circle];
  if (Math.random() < .5) spec.secondary = secondary;
  if (Math.random() < .5) spec.ability = ability;
  if (Math.random() < .5) spec.utility = utility;
  if (Math.random() < .5) spec.mod = mod;
  return this.createEnemy_(spec);
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
