var Renderer = di.service('Renderer', ['GameModel as gm', 'Screen', 'ctx']);

Renderer.prototype.init = function() {
  this.drawFns_ = _.pickFunctions(this, {prefix: 'draw', suffix: '_'});
  this.nightSky_ = {};
};

Renderer.prototype.update = function(dt) {
  this.handleCamera_(dt);
  this.drawBackground_();
  _.each(this.gm_.entities, this.drawEntity_.bind(this));
};

Renderer.prototype.drawBackground_ = function() {
  this.ctx_.save();
  this.ctx_.fillStyle = '#000000';
  this.ctx_.fillRect(0, 0, this.screen_.width, this.screen_.height);
  this.drawSky_();
  this.ctx_.restore();
};

Renderer.prototype.drawSky_ = function() {
  var GRID_SIZE = 30;
  var NUM_COLS = (this.screen_.width / GRID_SIZE)  + 2;
  var NUM_ROWS = (this.screen_.height / GRID_SIZE) + 2;
  var start = this.screen_.screenToCanvas(-GRID_SIZE, -GRID_SIZE, 2);
  start.x = Math.floor(start.x - start.x % GRID_SIZE);
  start.y = Math.floor(start.y - start.y % GRID_SIZE);
  for (var col = 0; col < NUM_COLS; col++) {
    for (var row = 0; row < NUM_ROWS; row++) {
      var x = start.x + GRID_SIZE * col;
      var y = start.y + GRID_SIZE * row;
      var key = x * 10000 + y;
      if (!this.nightSky_[key]) {
        this.nightSky_[key] = {
          x: x + _.random(GRID_SIZE) - GRID_SIZE / 2,
          y: y + _.random(GRID_SIZE) - GRID_SIZE / 2,
          radius: Math.pow(_.random(4), 3) / 64 + .5,
          color: _.generateGray(Math.random() * .75 + .2)
        };
      }
      var star = this.nightSky_[key];
      var pos = this.screen_.canvasToDraw(star.x, star.y, 2);
      this.ctx_.fillStyle = star.color;
      this.ctx_.beginPath();
      this.ctx_.arc(pos.x, pos.y, star.radius, 0, 2 * Math.PI, false);
      this.ctx_.closePath();
      this.ctx_.fill();
    }
  }
};

Renderer.prototype.drawEntity_ = function(entity) {
  if (entity.dead) return;
  this.ctx_.save();
  var draw = this.getDrawFn_(entity.type);
  var pos = this.screen_.canvasToDraw(entity.x, entity.y);
  draw(entity, pos);
  this.ctx_.restore();
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

var MAX_CAMERA_SPEED = 20;
var MAX_ZOOM_SPEED = 20000;
Renderer.prototype.handleCamera_ = function(dt) {
  if (this.gm_.scenes['battle'] == 'active') {
    // Pan camera.
    var e1 = this.gm_.entities['player'];
    var e2 = this.gm_.entities['enemy'];
    var target = {x: (e1.x + e2.x) / 2, y: (e1.y + e2.y) / 2};
    _.moveTowards(this.screen_, target, dt * MAX_CAMERA_SPEED);

    // Zoom camera.
    var dx = Math.abs(e1.x - this.screen_.x) - this.screen_.width / 2;
    var dy = Math.abs(e1.y - this.screen_.y) - this.screen_.height / 2;
    if (dx > -40 || dy > -40) {
      this.screen_.zoom(-MAX_ZOOM_SPEED * dt);
    } else if (dx < -100 && dy < -100) {
      this.screen_.zoom(MAX_ZOOM_SPEED * dt);
    }
  }
};
