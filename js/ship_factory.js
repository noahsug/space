var ShipFactory = di.service('ShipFactory', [
  'GameModel as gm', 'Entity', 'EntityDecorator as ed', 'Gameplay', 'Screen',
  'ShipDecorator', 'ItemService']);

ShipFactory.prototype.init = function() {
  this.d_ = this.ed_.getDecorators();
};

ShipFactory.prototype.createEnemyDna = function(shipData) {
  // DEBUG: Force enemy to have specific items.
  //return [
  //  'basic laser',
  //  //'shotgun',
  //  //'dash',
  //  //'gatling',
  //  //'knockback',
  //  //'divide'
  //  //'charge'
  //  //'haze',
  //  'pistol',
  //  //'reflect',
  //  //'shield',
  //  //'pull',
  //  //'tracker',
  //  //'teleport',
  //  //'charge',
  //  stage.hull.name,
  //].map(this.itemService_.getByName.bind(this.itemService_));

  return _.newList(Game.ITEM_TYPES, function(type) {
    return (shipData[type] && _.sample(shipData[type])) || undefined;
  }).concat([shipData.hull]);
};

ShipFactory.prototype.createEnemy = function(dna) {
  return this.createShip(this.gm_.stage.ship, 'bad');
};

ShipFactory.prototype.createPlayer = function() {
  return this.createShip(this.gm_.player, 'good');
};

ShipFactory.prototype.createShip = function(dna, style) {
  _.assert(dna);
  var ship = this.Entity_.new('ship');
  ship.dna = dna;  // For future cloning.
  if (style == 'good') ship.playerControlled = true;
  _.decorate(ship, this.shipDecorator_);
  if (style == 'good') ship.setMaxHealth(g.Health.PLAYER);
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
