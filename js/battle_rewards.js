var BattleRewards = di.service('BattleRewards', [
  'GameModel as gm', 'Inventory', 'ItemService', 'GameModel as gm',
  'MissionService']);

BattleRewards.prototype.rewardPlayer = function() {
  if (this.gm_.event.state != 'won' && !this.missionService_.beatGame()) {
    return null;
  }
  //var item = this.inventory_.getRandomUnowned();
  var item = this.itemService_.getByName('teleport');
  if (item) this.inventory_.add(item);
  return item;
};

//BattleRewards.prototype.calculateRewards = function() {
//  this.numItems_ = 0;
//  this.items_ = {};
//
//  // Give 4 items if last stage.
//  if (this.gm_.stage.end) {
//    _.each(Game.ITEM_TYPES, function(type) {
//      var level = this.getRandomLevel_();
//      var item = _.sample(this.inventory_.getUnownedByLevelAndType(
//          level, type));
//      if (item) this.rewardItem_(item);
//    }, this);
//    return;
//  }
//
//  if (!this.gm_.stage.hasItem && !this.gm_.stage.hasAugment) return;
//
//  // Give one random item or augment.
//  var level = this.getRandomLevel_();
//  var item = this.getRandomItem_(level, this.gm_.stage.hasAugment);
//  if (item) this.rewardItem_(item);
//
//  // Get enemy's items.
//  //_.each(Game.ITEM_TYPES, function(type) {
//  //  var item = this.itemService_.getEnemyEquipped(type);
//  //  if (item && !this.inventory_.hasItem(item)) {
//  //    this.items_[type] = item;
//  //    this.numItems_++;
//  //  }
//  //}, this);
//};
//
//BattleRewards.prototype.getRandomLevel_ = function() {
//  var levelRange = (Game.MAX_ITEM_LEVEL + 3) / this.gm_.world.missions.length;
//  var level = Math.round(
//      this.gm_.mission.index * levelRange + _.r.nextFloat(levelRange));
//  var r = Math.random();
//  if (level && r < .52) level--;
//  if (level && r < .25) level--;
//  if (level && r < .11) level--;
//  return Math.min(level, Game.MAX_ITEM_LEVEL);
//};
//
//BattleRewards.prototype.getRandomItem_ = function(level, returnAugment) {
//  return _.sample(this.inventory_.getUnownedByLevel(level, returnAugment));
//};
//
//BattleRewards.prototype.rewardItem_ = function(item) {
//  this.items_[item.category] = item;
//  this.numItems_++;
//  if (item.category == 'augment') {
//    this.inventory_.equip(item);
//    this.gm_.mission.augments.push(item);
//  }
//};
//
//BattleRewards.prototype.numItems = function() {
//  return this.numItems_;
//};
//
//BattleRewards.prototype.getReward = function(type) {
//  return this.items_[type] || {};
//};
