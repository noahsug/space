var World = di.service('World', [
  'GameModel as gm', 'ShipFactory']);

World.COLS = 3;
World.ROWS = 6;
World.START = [0, 0];
World.END = [World.COLS - 1, World.ROWS - 1];
World.LEVELS = World.COLS * World.ROWS;

World.prototype.create = function() {
  this.gm_.world = _.generate(function(i) {
    var startIndex = this.idx_.apply(this, World.START);
    var level = i && Math.floor(i / 5 + Math.random() * (2 + i / 5));
    return {
      type: level,
      locked: i != startIndex,
      result: '',
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

World.prototype.unlockAdjacent = function(level) {
  var col = level.index % World.COLS;
  var row = (level.index - col) / World.COLS;
  this.neighbors_(row, col).forEach(function(rowCol) {
    if (!this.isValid_(rowCol[0], rowCol[1])) return;
    this.get.apply(this, rowCol).locked = false;
  }, this);
};

World.prototype.won = function() {
  return this.get.apply(this, World.END).results == 'won';
};

World.prototype.lost = function() {
  //_.path(World.END, addNeighbors, atEnd, hash);
  return false;
};

World.prototype.isValid_ = function(row, col) {
  return _.between(row, 0, World.ROWS - 1) &&
    _.between(col, 0, World.COLS - 1);
};

World.prototype.neighbors_ = function(row, col) {
  return [[row, col - 1], [row, col + 1], [row - 1, col], [row + 1, col]];
};
