var BattleRewards = di.service('BattleRewards', [
  'GameModel as gm', 'Inventory']);

BattleRewards.prototype.getReward = function() {
  var level = this.gm_.level.type;
  var r = Math.random();
  var item;
  item = this.getRandomItem_(level);
  return {item: item};
};

BattleRewards.prototype.getRandomItem_ = function(level) {
  var r = Math.random();
  if (level && r < .52) level--;
  if (level && r < .25) level--;
  if (level && r < .11) level--;
  return _.sample(this.inventory_.getUnequippedByLevel(level));
};
