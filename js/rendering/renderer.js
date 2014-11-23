var Renderer = di.service('Renderer', [
  'GameModel as gm', 'Screen', 'ctx', 'Background']);

Renderer.prototype.init = function() {
  this.drawFns_ = _.pickFunctions(this, {prefix: 'draw', suffix: '_'});
};

Renderer.prototype.update = function(dt) {
  this.handleCamera_(dt);
  this.background_.draw();
  _.each(this.gm_.entities, this.drawEntity_.bind(this));
};

Renderer.prototype.drawEntity_ = function(entity) {
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
  var fontSize = Math.min(this.screen_.width / 5, this.screen_.height / 2);
  this.ctx_.strokeStyle = this.ctx_.shadowColor = '#FFFFFF';
  this.ctx_.lineWidth = 2;
  this.ctx_.fillStyle = '#FFFFFF';
  this.ctx_.shadowBlur = fontSize / 8;
  this.ctx_.font = 'bold ' + fontSize + 'px Arial';
  this.ctx_.textAlign = 'center';
  this.ctx_.textBaseline = 'alphabetic';

  this.ctx_.strokeText(title, this.screen_.x + pos.x, this.screen_.y + pos.y);
  this.ctx_.fillText(title, this.screen_.x + pos.x, this.screen_.y + pos.y);
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
    this.ctx_.lineWidth = 4;
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
  this.ctx_.arc(pos.x, pos.y, entity.radius - 2, 0, 2 * Math.PI);
  this.ctx_.stroke();
  this.ctx_.fill();
};

Renderer.prototype.drawLaser_ = function(entity, pos) {
  if (entity.dead) return;
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
  this.ctx_.arc(pos.x, pos.y, entity.radius - 2, 0, 2 * Math.PI);
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

var INTRO_SCROLL_SPEED = 10;
var BATTLE_CAMERA_SPEED = 20;
var BATTLE_ZOOM_SPEED = 20000;
var TRANSITION_CAMERA_SPEED = 100;
var TRANSITION_ZOOM_SPEED = 80000;
Renderer.prototype.handleCamera_ = function(dt) {
  if (this.gm_.scenes['intro'] == 'active' ||
     this.gm_.scenes['equip'] == 'active') {
    this.screen_.x -= INTRO_SCROLL_SPEED * dt;
    this.screen_.y -= INTRO_SCROLL_SPEED * dt;
  }

  if (this.gm_.scenes['battle'] == 'active') {
    // Pan camera.
    var e1 = this.gm_.entities['player'];
    var e2 = this.gm_.entities['enemy'];
    var target = {x: (e1.x + e2.x) / 2, y: (e1.y + e2.y) / 2};
    _.moveTowards(this.screen_, target, dt * BATTLE_CAMERA_SPEED);

    // Zoom camera.
    var dx = Math.abs(e1.x - this.screen_.x) - this.screen_.width / 2;
    var dy = Math.abs(e1.y - this.screen_.y) - this.screen_.height / 2;
    if (dx > -40 || dy > -40) {
      this.screen_.zoom(-BATTLE_ZOOM_SPEED * dt);
    } else if (dx < -100 && dy < -100) {
      this.screen_.zoom(BATTLE_ZOOM_SPEED * dt);
    }
  }

  if (this.gm_.scenes['battle'] == 'transition') {
    // Pan Camera
    var player = this.gm_.entities['player'];
    var enemy = this.gm_.entities['enemy'];
    var target = player.dead ? player : enemy;
    var arrived =
        _.moveTowards(this.screen_, target, dt * TRANSITION_CAMERA_SPEED);

    // Zoom camera
    var da = this.screen_.getSurfaceArea() - Screen.DESIRED_SURFACE_AREA;
    if (da > 0) {
      this.screen_.zoom(Math.min(TRANSITION_ZOOM_SPEED * dt, da));
    } else {
      this.screen_.zoom(Math.max(-TRANSITION_ZOOM_SPEED * dt, da));
    }

    if (arrived && Math.abs(da) <= TRANSITION_ZOOM_SPEED * dt) {
      this.gm_.scenes['battle'] = 'transitionOver';
    }
  }
};
