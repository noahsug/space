var Background = di.service('Background', [
  'Screen', 'ctx', 'bgCanvas', 'RepeatedBackground']);

Background.prototype.init = function() {
  this.nightSky_ = {};

  this.bgLayers_ = _.generate(function(i) {
    var bg = this.repeatedBackground_.create(this.bgCanvas_[i]);
    var starTile = this.createStarTile_(i);
    bg.setRepeatedTile(starTile);
    bg.setBgDistance(Math.pow(2, i + 1));
  }, 3, this);
};

Background.prototype.createStarTile_ = function(i) {
  var starTile = document.createElement('canvas');
  starTile.width = starTile.height = 600;
  //this.drawSky_(starTile);
  return starTile;
};

Background.prototype.drawSky_ = function(z) {
  var GRID_SIZE = 30;
  var NUM_COLS = (this.screen_.width / GRID_SIZE)  + 2;
  var NUM_ROWS = (this.screen_.height / GRID_SIZE) + 2;
  var start = this.screen_.screenToCanvas(-GRID_SIZE, -GRID_SIZE, z);
  start.x = Math.floor(start.x - start.x % GRID_SIZE);
  start.y = Math.floor(start.y - start.y % GRID_SIZE);
  for (var col = 0; col < NUM_COLS; col++) {
    for (var row = 0; row < NUM_ROWS; row++) {
      var x = start.x + GRID_SIZE * col;
      var y = start.y + GRID_SIZE * row;
      var key = x * 100000 + y + z / 10;
      if (!this.nightSky_[key]) {
        this.nightSky_[key] = {
          x: x + _.random(GRID_SIZE) - GRID_SIZE / 2,
          y: y + _.random(GRID_SIZE) - GRID_SIZE / 2,
          radius: Math.pow(_.random(4), 3) / 75 + .4,
          color: _.generateGray(Math.random() * .4 + .5)
        };
      }
      var star = this.nightSky_[key];
      var pos = this.screen_.canvasToDraw(star.x, star.y, z);
      this.ctx_.beginPath();
      this.ctx_.fillStyle = star.color;
      this.ctx_.moveTo(pos.x + star.radius, pos.y);
      this.ctx_.arc(pos.x, pos.y, star.radius, 0, 2 * Math.PI);
      this.ctx_.fill();
    }
  }
};

Background.prototype.draw = function() {
  this.ctx_.save();
  this.ctx_.fillStyle = '#000000';
  this.ctx_.fillRect(0, 0, this.screen_.width, this.screen_.height);

  this.drawSky_(2);
  this.drawSky_(4);
  this.drawSky_(8);

  this.ctx_.restore();
};
