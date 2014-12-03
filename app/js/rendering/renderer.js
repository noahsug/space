var Renderer = di.service('Renderer', [
  'GameModel as gm', 'Screen', 'ctx', 'Gfx', 'Background']);

Renderer.prototype.init = function() {
  this.style_ = {};
  this.drawFns_ = _.pickFunctions(this, {prefix: 'draw', suffix: '_'});
  var styleFns = _.pickFunctions(this, {prefix: 'add', suffix: 'Style_'});
  _.each(styleFns, function(fn, name) {
    this.style_[name] = {};
    fn.call(this, this.style_[name]);
  }, this);
};

Renderer.prototype.update = function(dt) {
  this.handleCamera_(dt);
  this.background_.draw();
  for (var i = 0; i < this.gm_.entities.length; i++) {
    this.drawEntity_(this.gm_.entities.arr[i]);
  }
  this.gfx_.flush();
};

Renderer.prototype.drawEntity_ = function(entity) {
  this.ctx_.save();
  var pos;
  if (entity.staticPosition) {
    pos = this.screen_.screenToDraw(entity.screenX, entity.screenY);
  } else {
    pos = this.screen_.canvasToDraw(entity.x, entity.y);
  }
  this.drawFns_[entity.type](entity, pos, this.style_[entity.type]);
  this.ctx_.restore();
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

Renderer.prototype.addShipStyle_ = function(style) {
  var baseStyle = {
    fill: Gfx.Color.BLACK,
    lineWidth: 3
  };
  style.good = this.gfx_.addStyle(_.extend({
    stroke: Gfx.Color.GREEN
  }, baseStyle));
  style.bad = this.gfx_.addStyle(_.extend({
    stroke: Gfx.Color.RED
  }, baseStyle));
};
Renderer.prototype.drawShip_ = function(entity, pos, style) {
  this.gfx_.setStyle(style[entity.style]);
  this.gfx_.circle(pos.x, pos.y, entity.radius);
};

Renderer.prototype.addLaserStyle_ = function(style) {
  style.weak = this.gfx_.addStyle({
    stroke: Gfx.Color.RED,
    lineWidth: 2
  });
  style.strong = this.gfx_.addStyle({
    stroke: Gfx.Color.YELLOW,
    lineWidth: 2
  });
};
Renderer.prototype.drawLaser_ = function(entity, pos, style) {
  if (entity.dead) return;
  this.gfx_.setStyle(style[entity.style]);
  this.gfx_.line(pos.x, pos.y, entity.dx, entity.dy);
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
var BATTLE_ZOOM_SPEED = 40000;
var TRANSITION_CAMERA_SPEED = 20;
var TRANSITION_ZOOM_SPEED = 40000;
Renderer.prototype.handleCamera_ = function(dt) {
  if (this.gm_.scenes['intro'] == 'active' ||
    this.gm_.scenes['equip'] == 'active') {
    this.screen_.x -= INTRO_SCROLL_SPEED * dt;
    this.screen_.y -= INTRO_SCROLL_SPEED * dt;
  }

  if (this.gm_.scenes['battle'] == 'active') {
    // Pan camera.
    var e1 = this.gm_.entities.obj['player'];
    var e2 = this.gm_.entities.obj['enemy'];
    var target = {x: (e1.x + e2.x) / 2, y: (e1.y + e2.y) / 2};
    _.moveTowards(this.screen_, target, dt * BATTLE_CAMERA_SPEED);

    // Zoom camera.
    var dx = Math.abs(e1.x - this.screen_.x) - this.screen_.width / 2;
    var dy = Math.abs(e1.y - this.screen_.y) - this.screen_.height / 2;
    if (dx > -60 || dy > -60) {
      this.screen_.zoom(-BATTLE_ZOOM_SPEED * dt);
    } else if (dx < -120 && dy < -120) {
      this.screen_.zoom(BATTLE_ZOOM_SPEED * dt);
    }
  }

  if (this.gm_.scenes['battle'] == 'transition') {
    // Zoom camera
    var difference =
        this.screen_.getSurfaceArea() - Screen.DESIRED_SURFACE_AREA;
    var zoom = Math.min(TRANSITION_ZOOM_SPEED * dt, difference);
    if (difference > 0) {
      this.screen_.zoom(zoom);
    } else {
      this.screen_.zoom(-zoom);
    }

    // Pan camera.
    var e1 = this.gm_.entities.obj['player'];
    var e2 = this.gm_.entities.obj['enemy'];
    var target = e1.dead ? e1 : e2;
    _.moveTowards(this.screen_, target, dt * TRANSITION_CAMERA_SPEED);
  }
};
