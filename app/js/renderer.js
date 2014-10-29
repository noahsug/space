var Renderer = di.service('Renderer', ['GameModel as gm', 'Screen', 'ctx']);

Renderer.prototype.init = function() {
};

Renderer.prototype.update = function(dt) {
  this.drawBackground_();
  _.each(this.gm_.entities, this.drawEntity_.bind(this));
};

Renderer.prototype.drawBackground_ = function() {
  this.ctx_.fillStyle = '#000000';
  this.ctx_.fillRect(0, 0, this.screen_.width, this.screen_.height);
};

Renderer.prototype.drawEntity_ = function(entity) {
  var draw = this.getDrawFn_(entity.type);
  var pos = this.screen_.translate(entity.x, entity.y);
  draw(entity, pos);
};

Renderer.prototype.getDrawFn_ = function(type) {
  switch(type) {
    case 'ship': return this.drawShip_.bind(this);
    case 'splash': return this.drawSplash_.bind(this);
    case 'btn': return this.drawBtn_.bind(this);
  }
  throw 'invalid entity type: ' + type;
};

Renderer.prototype.drawShip_ = function(entity, pos) {
  this.ctx_.fillStyle = '#000000';
  this.ctx_.lineWidth = 2;
  this.ctx_.shadowBlur = 5;

  var color = '#00FF00';
  if (entity.style == 'good') {
    color = '#4477FF';
  }
  this.ctx_.strokeStyle = this.ctx_.shadowColor = color;

  this.ctx_.beginPath();
  this.ctx_.arc(pos.x, pos.y, entity.radius, 0, 2 * Math.PI, false);
  this.ctx_.closePath();
  this.ctx_.stroke();
  this.ctx_.fill();
};

Renderer.prototype.drawSplash_ = function(entity, pos) {
  var title = 'SPACE.';
  var fontSize = Math.min(this.screen_.width / 4, this.screen_.height / 2);
  this.ctx_.strokeStyle = this.ctx_.shadowColor = '#FFFFFF';
  this.ctx_.lineWidth = 1;
  this.ctx_.fillStyle = '#FFFFFF';
  this.ctx_.shadowBlur = fontSize / 8;
  this.ctx_.font = 'bold ' + fontSize + 'px Arial';
  this.ctx_.textAlign = 'center';
  this.ctx_.textBaseline = 'alphabetic';

  this.ctx_.strokeText(title, pos.x, pos.y);
  this.ctx_.fillText(title, pos.x, pos.y);
};

Renderer.prototype.drawBtn_ = function(entity, pos) {
  this.ctx_.lineWidth = 2;
  this.ctx_.strokeStyle = this.ctx_.shadowColor = '#FFFFFF';
  this.ctx_.fillStyle = '#000000';
  this.ctx_.shadowBlur = entity.size / 8;
  this.ctx_.font = 'bold ' + entity.size + 'px Arial';
  this.ctx_.textAlign = 'center';
  this.ctx_.textBaseline = 'middle';

  if (entity.mouseOver) {
    this.ctx_.strokeStyle = this.ctx_.shadowColor = '#FFFF00';
    this.ctx_.lineWidth = 3;
  }

  this.ctx_.strokeText(entity.text, pos.x, pos.y);
  this.ctx_.fillText(entity.text, pos.x, pos.y);
};
