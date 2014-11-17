var Renderer = di.service('Renderer', ['GameModel as gm', 'Screen', 'ctx']);

Renderer.prototype.init = function() {
  this.drawFns_ = _.pickFunctions(this, {prefix: 'draw', suffix: '_'});
  this.skySeed_ = Math.random();
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
  this.drawSky_();
};

Renderer.prototype.drawSky_ = function() {
  var GRID_SIZE = 50;
  var NUM_COLS = (this.screen_.width / GRID_SIZE);
  var NUM_ROWS = (this.screen_.height / GRID_SIZE);
  var center = this.screen_.getCenter();
  var canvasCenter = this.screen_.canvasToDraw(center.x, center.y);
  var offsetX = canvasCenter.x % GRID_SIZE;
  var offsetY = canvasCenter.y % GRID_SIZE;
  var start = this.screen_.screenToDraw(-GRID_SIZE, -GRID_SIZE);
  start.x = start.x - start.x % GRID_SIZE + offsetX;
  start.y = start.y - start.y % GRID_SIZE + offsetY;
  for (var col = 0; col < NUM_COLS; col++) {
    for (var row = 0; row < NUM_ROWS; row++) {
      var x = start.x + GRID_SIZE * col;
      var y = start.y + GRID_SIZE * row;
      var seed =
          this.skySeed_ + (canvasCenter.x - x) * 10000 + (canvasCenter.y - y);
      x += _.pseudorandom(seed) * GRID_SIZE - GRID_SIZE / 2;
      seed += .1;
      y += _.pseudorandom(seed) * GRID_SIZE - GRID_SIZE / 2;
      seed += .1;
      var radius = 4 * _.pseudorandom(seed);
      radius = radius * radius * radius / 60 + 1;
      seed += .1;
      var color = _.generateGray(_.pseudorandom(seed) * .7 + .15);
      this.ctx_.fillStyle = color;
      this.ctx_.beginPath();
      this.ctx_.arc(x, y, radius, 0, 2 * Math.PI, false);
      this.ctx_.closePath();
      this.ctx_.fill();
    }
  }
};

Renderer.prototype.drawEntity_ = function(entity) {
  if (entity.dead) return;
  var draw = this.getDrawFn_(entity.type);
  var pos = this.screen_.canvasToDraw(entity.x, entity.y);
  draw(entity, pos);
};

Renderer.prototype.getDrawFn_ = function(type) {
  var drawFn = this.drawFns_[type];
  if (drawFn) return drawFn;
  throw 'invalid entity type: ' + type;
};

Renderer.prototype.drawSplash_ = function(entity, pos) {
  var title = 'COSMAL'; // TODO: Use triangle/square/circle for the A, C and O.
  var fontSize = Math.min(this.screen_.width / 4, this.screen_.height / 2);
  this.ctx_.strokeStyle = this.ctx_.shadowColor = '#FFFFFF';
  this.ctx_.lineWidth = 2;
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
  this.ctx_.lineWidth = 4;
  this.ctx_.shadowBlur = 4;

  var color = '#00FF00';
  if (entity.style == 'good') {
    color = '#4477FF';
  }
  this.ctx_.strokeStyle = this.ctx_.shadowColor = color;

  this.ctx_.beginPath();
  this.ctx_.arc(pos.x, pos.y, entity.radius - 2, 0, 2 * Math.PI, false);
  this.ctx_.closePath();
  this.ctx_.stroke();
  this.ctx_.fill();
};

Renderer.prototype.drawLaser_ = function(entity, pos) {
  this.ctx_.lineWidth = 2;
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

Renderer.prototype.drawInventorySlot_ = function(entity, pos) {
  this.ctx_.fillStyle = '#000000';
  this.ctx_.lineWidth = 4;
  this.ctx_.shadowBlur = 0;

  var color = '#FFFFFF';
  if (entity.equipped) {
    color = '#44FF77';
  }
  this.ctx_.strokeStyle = this.ctx_.shadowColor = color;

  this.ctx_.beginPath();
  this.ctx_.arc(pos.x, pos.y, entity.radius - 2, 0, 2 * Math.PI, false);
  this.ctx_.closePath();
  this.ctx_.stroke();
  this.ctx_.fill();

  if (entity.item) {
    this.drawItem_(entity.item, pos);
  };
};

Renderer.prototype.drawItem_ = function(item, pos) {
  var SIZE = 12;
  this.ctx_.fillStyle = '#FFFFFF';
  this.ctx_.font = SIZE + 'px Arial';
  this.ctx_.textAlign = 'center';
  this.ctx_.textBaseline = 'middle';
  this.ctx_.fillText(item.name, pos.x, pos.y);
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
