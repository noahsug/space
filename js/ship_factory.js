var ShipFactory = di.service('ShipFactory', [
  'GameModel as gm', 'Entity', 'EntityDecorator as ed', 'Gameplay', 'Screen',
  'ShipDecorator', 'ItemService']);

ShipFactory.prototype.createEnemyDna = function(level) {
  //return this.gameplay_.bosses[level];
  return this.createRandomDna_(level);
};

ShipFactory.prototype.createRandomDna_ = function(level) {
  // DEBUG.
  return [
    //'gatling',
    //'knockback',
    //'divide'
    //'charge'
    //'haze',
    'pistol',
    //'reflect',
    'shield',
    //'tracker',
    //'teleport',
    //'charge',
  ].map(this.itemService_.getByName.bind(this.itemService_));

  var levels = _.intRandomSplit(
      Game.ITEM_TYPES.length, level + 1, Game.MAX_ITEM_LEVEL + 1).
    sort().reverse();

  var numItems = levels.reduce(function(p, c) { return p + (c > 0); }, 0);
  // Ensure every ship has a primary weapon.
  var types = [Game.ITEM_TYPES[0]].concat(_.shuffle(Game.ITEM_TYPES.slice(1)));
  if (numItems > 1) _.swap(types, 0, _.r.nextInt(0, numItems - 1));

  var result = _.newList(types, function(type, i) {
    //if (type == 'utility') return this.itemService_.getByName('teleport');
    if (!levels[i]) return undefined;
    return _.sample(this.itemService_.getByTypeAndLevel(type, levels[i] - 1));
  }, this);

  console.log(level, types, levels, _.pluck(result, 'name'));

  return result;
};

ShipFactory.prototype.createEnemy = function() {
  return this.createShip(this.gm_.level.enemy, 'bad');
};

ShipFactory.prototype.createPlayer = function() {
  return this.createShip(this.gm_.player, 'good');
};

ShipFactory.prototype.createShip = function(dna, style) {
  if (!PROD) _.assert(dna);
  var ship = this.entity_.create('ship');
  ship.dna = dna;
  _.decorate(ship, this.shipDecorator_);
  if (style == 'good') ship.setMaxHealth(Health.PLAYER_HEALTH);
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
