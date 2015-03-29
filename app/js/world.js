var World = di.service('World', [
  'GameModel as gm', 'ShipFactory']);

World.COLS = 3;
World.ROWS = 6;
World.START = [0, 0];
World.END = [World.ROWS - 1, World.COLS - 1];
World.LEVELS = World.COLS * World.ROWS;

World.prototype.create = function() {
  this.gm_.world = _.generate(function(i) {
    var startIndex = this.idx_.apply(this, World.START);
    var level = Game.MAX_LEVEL * i / (World.LEVELS - 1);
    if (i != 0 && i != World.LEVELS - 1) {
      level = Math.round(level * .5 + Math.random() * (level * .5));
      if (level < Game.MAX_LEVEL && Math.random() < .5) level++;
      if (level < Game.MAX_LEVEL && Math.random() < .5) level++;
    }
    return {
      type: level,
      state: i == startIndex ? 'unlocked' : 'locked',
      index: i,
      enemy: this.shipFactory_.createEnemyDna(level)
    };
  }, World.LEVELS, this);
};

World.prototype.get = function(row, col) {
  if (!PROD) _.assert(this.isValid_(row, col));
  return this.gm_.world[this.idx_(row, col)];
};

World.prototype.idx_ = function(row, col) {
  return row * World.COLS + col;
};

World.prototype.rowCol_ = function(index) {
  var col = index % World.COLS;
  var row = (index - col) / World.COLS;
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

World.prototype.won = function() {
  return this.get.apply(this, World.END).state == 'won';
};

World.prototype.lost = function() {
  return !this.gm_.world.some(function(level) {
    return level.state == 'unlocked';
  }, this);
};

World.prototype.isValid_ = function(row, col) {
  return _.between(row, 0, World.ROWS - 1) &&
      _.between(col, 0, World.COLS - 1);
};

World.prototype.neighbors_ = function(row, col) {
  return [[row, col - 1], [row, col + 1], [row - 1, col], [row + 1, col]];
};
