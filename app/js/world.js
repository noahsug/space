var World = di.service('World', [
  'GameModel as gm', 'ShipFactory']);

World.START = [0, 0];

World.prototype.createWorlds = function() {
  _.each(this.gm_.worlds, function(world, i) {
    this.create(world, i);
  }, this);
};

// Takes a world obj and adds levels, index and state.
World.prototype.create = function(world, index) {
  this.gm_.world = world;
  world.index = index;
  world.state = index ? 'locked' : 'unlocked';
  world.lives = world.lives || 0;
  world.maxLives = world.lives;
  world.aquired = [];
  world.augments = [];

  var numLevels = world.rows * world.cols;
  // We assume the last level has the max number of levels.
  var lastLevel = this.gm_.worlds[this.gm_.worlds.length - 1];
  var maxNumLevels = lastLevel.rows * lastLevel.cols;
  var itemDist = _.intRandomSplit(numLevels - 2, (numLevels - 2) * .5, 1);
  itemDist = [1].concat(itemDist).concat(1);

  world.levels = _.generate(function(i) {
    var startIndex = this.idx_.apply(this, World.START);
    var level = Math.round(Game.MAX_LEVEL * i / (maxNumLevels - 1));
    level = Math.min(Game.MAX_LEVEL, level + index);
    if (i != 0 && i != numLevels - 1) {
      level = Math.round(level * .5 + Math.random() * (level * .5));
    }
    return {
      hasItem: itemDist[i],
      hasAugment: true,//!itemDist[i],
      type: level,
      state: i == startIndex ? 'unlocked' : 'locked',
      index: i,
      enemy: this.shipFactory_.createEnemyDna(level)
    };
  }, numLevels, this);
};

World.prototype.resetProgress = function() {
  var startIndex = this.idx_.apply(this, World.START);
  _.each(this.gm_.world.levels, function(level) {
    if (level.index == startIndex) level.state = 'unlocked';
    else level.state = 'locked';
  });
  this.gm_.world.augments = [];
  this.gm_.world.aquired = [];
  this.gm_.world.lives = this.gm_.world.maxLives;
};

World.prototype.get = function(row, col) {
  if (!PROD) _.assert(this.isValid_(row, col));
  return this.gm_.world.levels[this.idx_(row, col)];
};

World.prototype.idx_ = function(row, col) {
  return row * this.gm_.world.cols + col;
};

World.prototype.rowCol_ = function(index) {
  var col = index % this.gm_.world.cols;
  var row = (index - col) / this.gm_.world.cols;
  return [row, col];
};

World.prototype.unlockAdjacent = function(level) {
  var rowCol = this.rowCol_(level.index);
  this.neighbors_(rowCol[0], rowCol[1]).forEach(function(rowCol) {
    if (!this.isValid_(rowCol[0], rowCol[1])) return;
    var level = this.get.apply(this, rowCol);
    if (level.state == 'locked') level.state = 'unlocked';
  }, this);
};

World.prototype.end = function() {
  return [this.gm_.world.rows - 1, this.gm_.world.cols - 1];
};

World.prototype.won = function() {
  return this.get.apply(this, this.end()).state == 'won';
};

World.prototype.lost = function() {
  if (this.gm_.world.lives > 0) return false;
  if (this.end().status == 'lost') return true;
  return !this.gm_.world.levels.some(function(level) {
    return level.state == 'unlocked';
  }, this);
};

World.prototype.isValid_ = function(row, col) {
  return _.between(row, 0, this.gm_.world.rows - 1) &&
      _.between(col, 0, this.gm_.world.cols - 1);
};

World.prototype.neighbors_ = function(row, col) {
  return [[row, col - 1], [row, col + 1], [row - 1, col], [row + 1, col]];
};
