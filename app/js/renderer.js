var Renderer = di.service('Renderer', ['GameModel as gm', 'Screen', 'ctx']);

Renderer.prototype.init = function() {
};

Renderer.prototype.update = function() {
  this.drawBackground_();
  _.each(this.gm_.entities, this.drawEntity_.bind(this));
  if (this.gm_.scenes['battle']) {
    this.handleBattleCamera_();
  }
};

Renderer.prototype.drawBackground_ = function() {
  this.ctx_.fillStyle = '#000000';
  this.ctx_.fillRect(0, 0, this.screen_.width, this.screen_.height);
};

Renderer.prototype.drawEntity_ = function(entity) {
  if (entity.dead) return;
  var draw = this.getDrawFn_(entity.type);
  var pos = this.screen_.translate(entity.x, entity.y);
  draw(entity, pos);
};

Renderer.prototype.getDrawFn_ = function(type) {
  switch(type) {
    case 'ship': return this.drawShip_.bind(this);
    case 'splash': return this.drawSplash_.bind(this);
    case 'btn': return this.drawBtn_.bind(this);
    case 'laser': return this.drawLaser_.bind(this);
  }
  throw 'invalid entity type: ' + type;
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

Renderer.prototype.drawShip_ = function(entity, pos) {
  this.ctx_.fillStyle = '#000000';
  this.ctx_.lineWidth = 2;
  this.ctx_.shadowBlur = 4;

  var color = '#00FF00';
  if (entity.style == 'good') {
    color = '#4477FF';
  }
  this.ctx_.strokeStyle = this.ctx_.shadowColor = color;

  this.ctx_.beginPath();
  this.ctx_.arc(pos.x, pos.y, entity.radius - 1, 0, 2 * Math.PI, false);
  this.ctx_.closePath();
  this.ctx_.stroke();
  this.ctx_.fill();
};

Renderer.prototype.drawLaser_ = function(entity, pos) {
  this.ctx_.lineWidth = 1;
  this.ctx_.shadowBlur = 2;

  var color;
  if (entity.style == 'weak') {
    color = '#FF3333';
  } else {
    color = '#33FFFF';
  }
  this.ctx_.strokeStyle = this.ctx_.shadowColor = color;

  this.ctx_.beginPath();
  this.ctx_.moveTo(pos.x, pos.y);
  this.ctx_.lineTo(pos.x - entity.dx, pos.y - entity.dy);
  this.ctx_.closePath();
  this.ctx_.stroke();
};

Renderer.prototype.handleBattleCamera_ = function() {
  var e1 = this.gm_.entities['player'];
  var e2 = this.gm_.entities['enemy'];

  //var x = (e1.x + e2.x) / 2;
  //var y = (e1.y + e2.y) / 2;
  //this.screen_.center(e2.x, e2.y);

  //var xOffset = Math.abs(e1.x - x);
  //if (xOffset > this.screen_.width / 2) {
  //  this.screen_.setSurfaceArea((xOffset + 20) * 2 * this.screen_.height);
  //  this.update();
  //}
  //var yOffset = Math.abs(e1.y - y);
  //if (yOffset > this.screen_.height / 2) {
  //  this.screen_.setSurfaceArea((yOffset + 20) * 2 * this.screen_.width);
  //  this.update();
  //}
};
