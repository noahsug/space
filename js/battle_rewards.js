var BattleRewards = di.service('BattleRewards', [
  'GameModel as gm', 'Inventory']);

BattleRewards.prototype.getReward = function(won) {
  if (!won) {
    return {stat: this.getRandomStat_(-1)};
  }

  var level = this.gm_.level;
  var enemy = this.gm_.enemy;
  var r = Math.random();
  var item, stat;
  if (enemy == 'boss') {
    item = this.getRandomItem_(level + 1);
  } else if (r < .15) {
    item = this.getRandomItem_(level);
  } else {
    stat = this.getRandomStat_(level);
  }
  return {stat: stat, item: item};
};

BattleRewards.prototype.getRandomItem_ = function(level) {
  var r = Math.random();
  if (level && r < .52) level--;
  if (level && r < .25) level--;
  if (level && r < .11) level--;
  return _.sample(this.inventory_.getUnequippedByLevel(level));
};

BattleRewards.prototype.getRandomStat_ = function(level) {
  var stat = _.sampleKey(this.gm_.playerStats);
  var value = 1 + Math.round((1 + level) * (1.3 + .4 * Math.random()));
  return {name: stat, value: value};
};
