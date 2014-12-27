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
  this.handleCamera_(dt / this.gm_.speed);
  this.background_.draw();
  for (var i = 0; i < this.gm_.entities.length; i++) {
    this.drawEntity_(this.gm_.entities.arr[i], dt);
  }
  this.gfx_.flush();
};

var INTRO_SCROLL_SPEED = 10;
Renderer.prototype.handleCamera_ = function(dt) {
  if (this.gm_.scenes['battle'] == 'inactive') {
    this.screen_.x -= INTRO_SCROLL_SPEED * dt;
    this.screen_.y -= INTRO_SCROLL_SPEED * dt;
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
  entity.render.damaged = 0;
  entity.render.damageDuration = 0;
  entity.render.radius = entity.radius;
};
Renderer.prototype.addShipStyle_ = function(style) {
  var baseStyle = {
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
  style.affectedEngine = this.gfx_.addStyle({
    stroke: Gfx.Color.BLUE
  });
};
Renderer.prototype.drawShip_ = function(entity, pos, style, dt) {
  if (!entity.dead) {
    // Don't resize instantly.
    var rGap = entity.radius - entity.render.radius;
    if (rGap) {
      var dr = Math.sign(rGap) * 10 * dt;
      if (Math.abs(rGap) < Math.abs(dr)) {
        entity.render.radius = entity.radius;
      } else {
        entity.render.radius += dr;
      }
    }

    // Shake afer taking damage.
    if (this.gm_.scenes['battle'] == 'active') {
      var damage = entity.prevHealth - entity.health;
      if (damage) {
        entity.render.damageDuration = 3;
        entity.render.damage = 2 + damage / 2;
      }
      if (entity.render.damageDuration) {
        pos.x += Math.random() * entity.render.damage;
        pos.y += Math.random() * entity.render.damage;
        entity.render.damageDuration--;
      }
    }

    // Rotate / size engine based on remaining health.
    if (!entity.effects.stunned.value) {
      var rotationSpeed = Math.max(entity.health, 0) / ROTATION_HEALTH_RATIO +
          BASE_ROTATION;
      entity.render.rotation += rotationSpeed * dt;
    }
    if (entity.effects.weaponsDisabled.value) {
      this.gfx_.setStyle(style.affectedEngine);
    } else {
      this.gfx_.setStyle(style[entity.style + 'Engine']);
    }
    var sizeRatio = (entity.health / entity.maxHealth) * .8 + .2;

    // Draw engine.
    //entity.render.engineSize = (entity.render.radius - 4) * sizeRatio;
    //var triangle = _.geometry.circumscribeTriangle(
    //    pos.x, pos.y, entity.render.engineSize, entity.render.rotation);
    //this.gfx_.triangle(triangle.x1, triangle.y1,
    //                   triangle.x2, triangle.y2,
    //                   triangle.x3, triangle.y3);
  }

  // Draw ship.
  this.gfx_.setStyle(style[entity.style]);
  this.gfx_.circle(pos.x, pos.y, entity.render.radius - 2);
};

var SPEED_FUDGING = 8;
Renderer.prototype.addLaserStyle_ = function(style) {
  style.weak = this.gfx_.addStyle({
    stroke: Gfx.Color.RED,
    lineWidth: 4
  });
  style.strong = this.gfx_.addStyle({
    stroke: Gfx.Color.YELLOW,
    lineWidth: 4
  });
  style.effect = this.gfx_.addStyle({
    stroke: Gfx.Color.PINK,
    lineWidth: 6
  });
};
Renderer.prototype.drawLaser_ = function(entity, pos, style) {
  if (entity.dead) {
    entity.remove = true;
    return;
  }

  if (entity.style == 'bullet') {
    this.gfx_.setStyle(style.strong);
  } else if (entity.style == 'effect') {
    this.gfx_.setStyle(style.effect);
  } else {
    this.gfx_.setStyle(style.weak);
  }
  var dx = Math.cos(entity.rotation) * SPEED_FUDGING;
  var dy = Math.sin(entity.rotation) * SPEED_FUDGING;
  this.gfx_.line(pos.x + dx, pos.y + dy,
                 entity.dx - dx * 2, entity.dy - dy * 2);
};

var EXPLOSION_DURATION = .1;
var NORMAL_SIZE = .2;
Renderer.prototype.addBombStyle_ = function(style) {
  style.normal = this.gfx_.addStyle({
    stroke: Gfx.Color.BLUE,
    lineWidth: 2
  });
  style.effect = this.gfx_.addStyle({
    stroke: Gfx.Color.PINK,
    lineWidth: 2
  });
  style.explode = this.gfx_.addStyle({
    fill: Gfx.Color.YELLOW
  });
  style.effectExplode = this.gfx_.addStyle({
    fill: Gfx.Color.BLUE
  });
};
Renderer.prototype.drawBomb_ = function(entity, pos, style, dt) {
  if (entity.dead) {
    // Draw explosion.
    if (!_.isDef(entity.render.explodeTime)) {
      entity.render.explodeTime = 0;
    }

    entity.render.explodeTime += dt;
    var ratio = Math.min(entity.render.explodeTime / EXPLOSION_DURATION, 1);
    if (entity.style == 'effect') {
      this.gfx_.setStyle(style.effectExplode);
    } else {
      this.gfx_.setStyle(style.explode);
    }
    this.gfx_.circle(pos.x, pos.y, Math.pow(ratio, 2) * entity.radius);

    if (ratio == 1) entity.remove = true;
  } else {
    if (entity.style == 'effect') {
      this.gfx_.setStyle(style.effect);
    } else {
      this.gfx_.setStyle(style.normal);
    }
    this.gfx_.circle(pos.x, pos.y, entity.radius * NORMAL_SIZE);
  }
};

var ROTATION_SPEED = 10;
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
  if (entity.dead) {
    entity.remove = true;
    return;
  }
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
