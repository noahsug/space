var ShipFactory = di.service('ShipFactory', [
  'GameModel as gm', 'Entity', 'EntityDecorator as ed', 'Gameplay', 'Screen',
  'ShipDecorator', 'ItemService']);

ShipFactory.prototype.init = function() {
  this.d_ = this.ed_.getDecorators();
};

ShipFactory.prototype.createEnemyDna = function(stage) {
  // DEBUG.
  return [
    //'basic laser',
    'shotgun',
    'dash',
    //'gatling',
    //'knockback',
    //'divide'
    //'charge'
    //'haze',
    //'pistol',
    //'reflect',
    //'shield',
    //'pull',
    //'tracker',
    //'teleport',
    //'charge',
    stage.hull.name,
  ].map(this.itemService_.getByName.bind(this.itemService_));

  var levels = _.intRandomSplit(
      Game.ITEM_TYPES.length, stage.level + 1, Game.MAX_ITEM_LEVEL + 1).
        sort().reverse();

  var numItems = levels.reduce(function(p, c) { return p + (c > 0); }, 0);
  // Ensure every ship has a primary weapon.
  var types = [Game.ITEM_TYPES[0]].concat(_.shuffle(Game.ITEM_TYPES.slice(1)));
  if (numItems > 1) _.swap(types, 0, _.r.nextInt(0, numItems - 1));

  var items = _.newList(types, function(type, i) {
    if (!levels[i]) return undefined;
    return _.sample(this.itemService_.getByTypeAndLevel(type, levels[i] - 1));
  }, this);
  items.push(stage.hull);
  return items;
};

ShipFactory.prototype.createEnemy = function() {
  return this.createShip(this.gm_.stage.enemy, 'bad');
};

ShipFactory.prototype.createPlayer = function() {
  return this.createShip(this.gm_.player, 'good');
};

ShipFactory.prototype.createShip = function(dna, style) {
  if (!PROD) _.assert(dna);
  var ship = this.entity_.create('ship');
  ship.dna = dna;  // For future cloning.
  _.decorate(ship, this.shipDecorator_);
  if (style == 'good') ship.setMaxHealth(Health.PLAYER);
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
