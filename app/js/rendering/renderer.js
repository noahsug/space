var Renderer = di.service('Renderer', [
  'GameModel as gm', 'Screen', 'ctx', 'Gfx', 'Background']);

Renderer.prototype.init = function() {
  this.initFns_ = _.pickFunctions(this, {prefix: 'init', suffix: '_'});
  this.drawFns_ = _.pickFunctions(this, {prefix: 'draw', suffix: '_'});
  var styleFns = _.pickFunctions(this, {prefix: 'add', suffix: 'Style_'});
  this.style_ = {};
  _.each(styleFns, function(fn, name) {
    this.style_[name] = {};
    fn.call(this, this.style_[name]);
  }, this);
};

Renderer.prototype.update = function(dt) {
  this.handleCamera_(dt);
  this.background_.draw();
  for (var i = 0; i < this.gm_.entities.length; i++) {
    this.drawEntity_(this.gm_.entities.arr[i], dt);
  }
  this.gfx_.flush();
};

var INTRO_SCROLL_SPEED = 10;
var BATTLE_CAMERA_SPEED = 20;
var BATTLE_ZOOM_SPEED = 40000;
var TRANSITION_CAMERA_SPEED = 20;
var TRANSITION_ZOOM_SPEED = 40000;
Renderer.prototype.handleCamera_ = function(dt) {
  if (this.gm_.scenes['battle'] == 'inactive') {
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
    var zoom = Math.min(TRANSITION_ZOOM_SPEED * dt, Math.abs(difference));
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

Renderer.prototype.drawEntity_ = function(entity, dt) {
  this.ctx_.save();
  var pos;
  if (entity.staticPosition) {
    pos = this.screen_.screenToDraw(entity.screenX, entity.screenY);
  } else {
    pos = this.screen_.canvasToDraw(entity.x, entity.y);
  }
  if (!entity.render) {
    entity.render = {};
    this.initFns_[entity.type] && this.initFns_[entity.type](entity);
  }
  this.drawFns_[entity.type](entity, pos, this.style_[entity.type], dt);
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

Renderer.prototype.drawResultsSplash_ = function(entity, pos) {
  var title = this.gm_.results.won ? 'Victory' : 'Defeat';
  var fontSize = Math.min(this.screen_.width / 5, this.screen_.height / 2);
  this.ctx_.strokeStyle = this.ctx_.shadowColor = '#FFFFFF';
  this.ctx_.lineWidth = 2;
  this.ctx_.fillStyle = '#FFFFFF';
  this.ctx_.shadowBlur = fontSize / 8;
  this.ctx_.font = 'bold ' + fontSize + 'px Arial';
  this.ctx_.textAlign = 'center';
  this.ctx_.textBaseline = 'alphabetic';

  var x = this.screen_.x + pos.x;
  var y = this.screen_.y + pos.y - this.screen_.height / 2 + 100;
  this.ctx_.strokeText(title, x, y);
  this.ctx_.fillText(title, x, y);

  if (this.gm_.results.won) {
    this.ctx_.restore();
    var itemPos = {
      x: this.screen_.x + pos.x,
      y: this.screen_.y + pos.y
    };
    this.drawItem_(this.gm_.results.earned, itemPos);
    title = 'aquired:';
    y = itemPos.y - 20;
    this.ctx_.fillText(title, x, y);
  }
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

var ROTATION_HEALTH_RATIO = 2;
var BASE_ROTATION = 1;
Renderer.prototype.initShip_ = function(entity) {
  entity.render.rotation = 0;
  entity.render.engineSize = entity.radius;
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
  style.goodEngine = this.gfx_.addStyle({
    stroke: Gfx.Color.GREEN
  });
  style.badEngine = this.gfx_.addStyle({
    stroke: Gfx.Color.RED
  });
  style.damagedEngine = this.gfx_.addStyle({
    stroke: Gfx.Color.BLUE
  });
};
Renderer.prototype.drawShip_ = function(entity, pos, style, dt) {
  this.gfx_.setStyle(style[entity.style]);
  this.gfx_.circle(pos.x, pos.y, entity.radius - 2);

  if (!entity.dead) {
    var rotationSpeed = Math.max(entity.health, 0) / ROTATION_HEALTH_RATIO +
        BASE_ROTATION;
    entity.render.rotation += rotationSpeed * dt;
    this.gfx_.setStyle(style[entity.style + 'Engine']);
    var sizeRatio = (entity.health / entity.maxHealth) * .75;
    entity.render.engineSize = (entity.radius - 2) * sizeRatio;
    var triangle = _.geometry.circumscribeTriangle(
        pos.x, pos.y, entity.render.engineSize, entity.render.rotation);
    this.gfx_.triangle(triangle.x1, triangle.y1,
                       triangle.x2, triangle.y2,
                       triangle.x3, triangle.y3);
  }
};

Renderer.prototype.addLaserStyle_ = function(style) {
  style.weak = this.gfx_.addStyle({
    stroke: Gfx.Color.RED,
    lineWidth: 4
  });
  style.strong = this.gfx_.addStyle({
    stroke: Gfx.Color.YELLOW,
    lineWidth: 4
  });
};
Renderer.prototype.drawLaser_ = function(entity, pos, style) {
  if (entity.dead) return;

  var length = 8;
  if (entity.style == 'pellet') {
    this.gfx_.setStyle(style.strong);
    length = 4;
  } else {
    this.gfx_.setStyle(style.weak);
  }
  var dx = Math.cos(entity.rotation) * length;
  var dy = Math.sin(entity.rotation) * length;
  this.gfx_.line(pos.x, pos.y, dx, dy);
};

var EXPLOSION_DURATION = .1;
var NORMAL_SIZE = .2;
Renderer.prototype.addBombStyle_ = function(style) {
  style.normal = this.gfx_.addStyle({
    stroke: Gfx.Color.BLUE,
    lineWidth: 2
  });
  style.explode = this.gfx_.addStyle({
    fill: Gfx.Color.YELLOW
  });
};
Renderer.prototype.drawBomb_ = function(entity, pos, style, dt) {
  if (entity.remove) return;
  if (entity.dead) {
    // Draw explosion.
    if (!_.isDef(entity.render.explodeTime)) {
      entity.render.explodeTime = 0;
    }

    entity.render.explodeTime += dt;
    var ratio = Math.min(entity.render.explodeTime / EXPLOSION_DURATION, 1);
    this.gfx_.setStyle(style.explode);
    this.gfx_.circle(pos.x, pos.y, Math.pow(ratio, 2) * entity.radius);

    if (ratio == 1) entity.remove = true;
  } else {
    this.gfx_.setStyle(style.normal);
    this.gfx_.circle(pos.x, pos.y, entity.radius * NORMAL_SIZE);
  }
};

var ROTATION_SPEED = 8;
Renderer.prototype.initBlade_ = function(entity) {
  entity.render.rotation = 0;
};
Renderer.prototype.addBladeStyle_ = function(style) {
  style.normal = this.gfx_.addStyle({
    stroke: Gfx.Color.BLUE,
    lineWidth: 2
  });
};
Renderer.prototype.drawBlade_ = function(entity, pos, style, dt) {
  if (entity.dead) return;
  entity.render.rotation += dt * ROTATION_SPEED;
  var triangle = _.geometry.circumscribeTriangle(
      pos.x, pos.y, entity.radius - 1, entity.render.rotation);
  this.gfx_.setStyle(style.normal);
  this.gfx_.triangle(triangle.x1, triangle.y1,
                     triangle.x2, triangle.y2,
                     triangle.x3, triangle.y3);

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
