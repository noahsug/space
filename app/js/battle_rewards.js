var BattleRewards = di.service('BattleRewards', [
  'GameModel as gm', 'Inventory']);

BattleRewards.prototype.getReward = function(won) {
  if (!won) return {};
  var level = this.gm_.level;
  var enemy = this.gm_.enemy;
  var r = Math.random();
  var item;
  if (enemy == 'boss') {
    item = this.getRandomItem_(level + 1);
  } else if (r < .15) {
    item = this.getRandomItem_(level);
  }

  return {item: item};
};

BattleRewards.prototype.getRandomItem_ = function(level) {
  var r = Math.random();
  if (level && r < .52) level--;
  if (level && r < .25) level--;
  if (level && r < .11) level--;
  return _.sample(this.inventory_.getUnequippedByLevel(level));
};
