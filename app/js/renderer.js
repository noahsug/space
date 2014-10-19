var Renderer = di.service('Renderer', ['GameModel as gm', 'Screen', 'ctx']);

Renderer.prototype.init = function() {
};

Renderer.prototype.update = function(dt) {
  this.drawBackground_();
  this.gm_.entities.forEach(this.drawEntity_.bind(this));
};

Renderer.prototype.drawBackground_ = function() {
  this.ctx_.fillStyle = '#000000';
  this.ctx_.fillRect(0, 0, this.screen_.width, this.screen_.height);
};

Renderer.prototype.drawEntity_ = function(entity) {
  var draw = this.getDrawFn_(entity.type);
  var pos = this.screen_.translate(entity.x, entity.y);
  draw(pos, entity);
};

Renderer.prototype.getDrawFn_ = function(type) {
  switch(type) {
    case 'player': return this.drawPlayer_.bind(this);
    case 'splash': return this.drawSplash_.bind(this);
  }
  throw 'invalid entity type: ' + type;
};

Renderer.prototype.drawPlayer_ = function(pos, entity) {
  this.ctx_.beginPath();
  this.ctx_.arc(pos.x, pos.y, entity.radius, 0, 2 * Math.PI, false);
  this.ctx_.closePath();

  this.ctx_.fillStyle = '#000000';
  this.ctx_.strokeStyle = '#00FF00';
  this.ctx_.lineWidth = 1;
  this.ctx_.shadowColor = '#00FF00';
  this.ctx_.shadowBlur = 5;
  this.ctx_.stroke();
  this.ctx_.fill();
};

Renderer.prototype.drawSplash_ = function(pos, entity) {
  var fontSize = Math.min(this.screen_.width / 5, this.screen_.height / 3);
  this.ctx_.strokeStyle = this.ctx_.shadowColor = '#FFFFFF';
  this.ctx_.fillStyle = '#000000';
  this.ctx_.shadowBlur = 5;
  this.ctx_.font = fontSize + 'px Arial';
  this.ctx_.textAlign = 'center';
  this.ctx_.textBaseline = 'bottom';
  this.ctx_.strokeText('Space.', pos.x, pos.y);
  this.ctx_.fillText('Space.', pos.x, pos.y);
};
