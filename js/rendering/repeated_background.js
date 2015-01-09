var RepeatedBackground = di.factory('RepeatedBackground', ['Screen']);

RepeatedBackground.prototype.init = function(ctx) {
  this.ctx_ = ctx;
  this.distance_ = 1;
  this.updateCount_ = 0;
};

RepeatedBackground.prototype.setRepeatedTile = function(tile) {
  this.tileSize_ = tile.width;
  this.bgImage_ = document.createElement('canvas');
  this.bgImage_.width = this.bgImage_.height = tile.width * 2;
  var ctx = this.bgImage_.getContext('2d');
  ctx.drawImage(tile, 0, 0);
  ctx.drawImage(tile, tile.width, 0);
  ctx.drawImage(tile, 0, tile.height);
  ctx.drawImage(tile, tile.width, tile.height);
};

RepeatedBackground.prototype.setBgDistance = function(distance) {
  this.distance_ = distance;
};

RepeatedBackground.prototype.draw = function() {
  if (this.updateCount_++ % (this.distance_)) return;
  //_.assert(this.tileSize_, 'Must call setRepeatedTile() before draw()');
  this.ctx_.clearRect(0, 0, this.ctx_.canvas.width, this.ctx_.canvas.height);
  var x = (-this.screen_.x / this.distance_) % this.tileSize_;
  var y = (-this.screen_.y / this.distance_) % this.tileSize_;
  if (x > 0) x -= this.tileSize_;
  if (y > 0) y -= this.tileSize_;
  this.ctx_.drawImage(this.bgImage_, x, y);
};
