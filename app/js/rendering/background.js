var Background = di.service('Background', [
  'GameModel as gm', 'Screen', 'canvas', 'ctx', 'bgCtxList',
  'RepeatedBackground']);

// Screen should never have a width or height larger than 2x this value.
var BG_TILE_SIZE = 600;

Background.prototype.init = function() {
  this.bgLayers_ = this.createBgLayers_();
  // TODO: Fade away bg layer 2 and 3 when in battle.
};

Background.prototype.createBgLayers_ = function() {
  return _.generate(function(i) {
    var bg = this.repeatedBackground_.create(this.bgCtxList_[i]);
    var bgColor = i == this.bgCtxList_.length -1 ? '#000000' : '';
    var starTile = this.createStarTile_(bgColor);
    bg.setRepeatedTile(starTile);
    bg.setBgDistance(Math.pow(2, i + 1));
    return bg;
  }, this.bgCtxList_.length, this);
};

Background.prototype.createStarTile_ = function(bgColor) {
  var starTile = document.createElement('canvas');
  var ctx = starTile.getContext('2d');
  starTile.width = starTile.height = BG_TILE_SIZE;
  if (bgColor) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, starTile.width, starTile.height);
  } else {
    // Hack: Background must be filled for arcs to be drawn correctly.
    ctx.fillStyle = 'rgba(0, 0, 0, .00001)';
    ctx.fillRect(0, 0, starTile.width, starTile.height);
  }
  this.drawSky_(ctx, starTile.width, starTile.height);
  return starTile;
};

Background.prototype.drawSky_ = function(ctx, width, height) {
  var GRID_SIZE = 33;
  var NUM_COLS = (width / GRID_SIZE);
  var NUM_ROWS = (height / GRID_SIZE);
  var MIN_COLOR = .65;
  var MAX_COLOR = .95;
  for (var col = 0; col < NUM_COLS; col++) {
    for (var row = 0; row < NUM_ROWS; row++) {
      var radius = Math.pow(_.random(4), 3) / 80 + .6;
      var x = Math.floor(
          GRID_SIZE * col + radius + _.random(GRID_SIZE - radius * 2));
      var y = Math.floor(
          GRID_SIZE * row + radius + _.random(GRID_SIZE - radius * 2));

      var color = _.generateGray(_.r.nextFloat(MIN_COLOR, MAX_COLOR));

      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
};

Background.prototype.draw = function() {
  //this.ctx_.clearRect(0, 0, this.screen_.width, this.screen_.height);
  this.canvas_.width = this.canvas_.width;  // Clear the canvas.

  // TODO: Draw short trails behind moving objects during battle by clearing
  // away half the alpha of shapes on the canvas.

  //this.ctx_.globalCompositeOperation = "source-under";
  //this.ctx_.fillStyle = 'rgba(0, 0, 0, .5)';
  //this.ctx_.fillRect(0, 0, this.screen_.width, this.screen_.height);
  _.each(this.bgLayers_, function(bg) { bg.draw(); });
};
