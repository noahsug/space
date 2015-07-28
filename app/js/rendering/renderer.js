var Renderer = di.service('Renderer', [
  'GameModel as gm', 'Screen', 'ctx', 'textCtx', 'Gfx', 'Background',
  'TextService', 'ItemService', 'Inventory', 'SpriteService']);

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
  this.handleCamera_(dt / this.gm_.gameSpeed);
  var softClear = this.gm_.scenes.battle == 'active';
  this.background_.draw(softClear);
  for (var i = 0; i < this.gm_.entities.length; i++) {
    this.drawEntity_(this.gm_.entities.arr[i], dt);
  }
  this.gfx_.flush();
  //this.drawFps_(dt);
};

Renderer.prototype.drawFps_ = function(dt) {
  if (!this.fps_) {
    this.displayedFps_ = 0;
    this.fpsLastUpdated_ = 0;
    this.fps_ = 0;
  }
  var fps = 1 / dt;
  var change = (fps - this.fps_) / (2000 * dt);
  this.fps_ = Math.abs(change) > 10 ? fps : this.fps_ + change;
  this.fpsLastUpdated_ += dt;
  if (this.fpsLastUpdated_ > .2) {
    this.displayedFps_ = this.fps_;
    this.fpsLastUpdated_ -= .2;
  }

  this.textCtx_.textAlign = 'left';
  this.textCtx_.textBaseline = 'top';
  this.ctx_.fillStyle = 'black';
  this.ctx_.fillRect(0, 0, 40, 20);
  this.drawText_(this.displayedFps_.toFixed(0), 20, 0, 0, {color: '#ccc'});
};

var STAR_SCROLL_SPEED = 7;
Renderer.prototype.handleCamera_ = function(dt) {
  if (this.gm_.scenes['battle'] != 'inactive') {
    return;
  }
  this.screen_.x -= STAR_SCROLL_SPEED * dt;
  this.screen_.y -= STAR_SCROLL_SPEED * dt;
};

Renderer.prototype.drawEntity_ = function(e, dt) {
  if (!e.r) {
    e.r = {};
    this.initFns_[e.type] && this.initFns_[e.type](e);
  }
  var pos = this.getPos_(e);
  e.r.x = pos.x;
  e.r.y = pos.y;

  if (_.isDef(e.alpha)) this.textCtx_.globalAlpha = e.alpha;
  this.drawFns_[e.type](e, this.style_[e.type], dt);
  this.textCtx_.globalAlpha = 1;
};

Renderer.prototype.getPos_ = function(e) {
  if (e.staticPosition) {
    return this.screen_.screenToDraw(e.screenX, e.screenY);
  } else {
    return this.screen_.canvasToDraw(e.x, e.y);
  }
};

// UiElement draw functions.

Renderer.prototype.drawLoadingSplash_ = function(e) {
  this.ctx_.font = 10 + 'px ' + Gfx.Font.TITLE;
  this.ctx_.fillText('.', 0, 0);
  this.ctx_.font = 10 + 'px ' + Gfx.Font.TEXT;
  this.ctx_.fillText('.', 0, 0);

  this.ctx_.globalAlpha = Math.max(1 - e.loading, 0);
  this.ctx_.fillStyle = '#000000';
  this.ctx_.fillRect(0, 0, this.screen_.width, this.screen_.height);
  this.ctx_.globalAlpha = 1;
};

Renderer.prototype.drawHealthBars_ = function(e) {
  this.ctx_.globalAlpha = e.alpha || 0;
  this.drawHealthBar_(e.player, Gfx.Color.PLAYER_HEALTH, -1);
  this.drawHealthBar_(e.enemy, Gfx.Color.ENEMY_HEALTH, 1);
  this.ctx_.globalAlpha = 1;
};

Renderer.prototype.drawHealthBar_ = function(ship, color, dir) {
  var width = this.screen_.width / 2;
  var height = 4;
  var r1 = Math.max((ship.health + ship.r.damageTaken) / ship.maxHealth, 0);
  var r2 = Math.max(ship.health / ship.maxHealth, 0);
  this.ctx_.fillStyle = color;
  this.ctx_.fillRect(width, 0, width * r1 * dir, height);

  this.ctx_.fillStyle = 'rgba(0, 0, 0, .25)';
  this.ctx_.fillRect(width, 0, width * r2 * dir, height);
};

Renderer.prototype.drawBackdrop_ = function(e) {
  var bgColor = 'rgba(0, 0, 0, ' + e.baseAlpha + ')';
  this.textCtx_.fillStyle = bgColor;
  this.fillRect_(0, 0, this.screen_.width, this.screen_.height);
};

Renderer.prototype.drawContainer_ = function(e) {
  if (e.style == 'hidden') return;
  var bgColor = this.getBgColor_(e.bgStyle);
  if (bgColor) {
    this.textCtx_.fillStyle = bgColor;
    this.fillRect_(e.r.x, e.r.y, e.width, e.height);
  }

  var borderColor = this.getBgColor_(e.borderStyle);
  if (borderColor) {
    this.textCtx_.strokeStyle = borderColor;
    this.textCtx_.lineWidth = 2;
    this.strokeRect_(e.r.x, e.r.y, e.width, e.height);
  }

  // DEBUG: Draw layouts.
  //this.ctx_.fillStyle = 'rgba(255, 0, 0, .1)';
  //this.ctx_.strokeStyle = 'rgba(50, 50, 50, .5)';
  //this.ctx_.lineWidth = 2;
  //this.ctx_.fillRect(e.r.x, e.r.y, e.width, e.height);
  //this.ctx_.strokeRect(e.r.x, e.r.y, e.width, e.height);
};

Renderer.prototype.drawStage_ = function(e) {
  var drawFn = this.circle_;
  if (e.style == 'checkpoint') drawFn = this.square_;
  drawFn = drawFn.bind(this);

  var radius = 15;
  if (e.style == 'checkpoint') radius -= 2;  // Keep surface area the same.
  var ratio = e.progress / 2;  // distribution in [0-1]

  var lineWidth = _.interpolate([1, 2, 1], ratio);
  drawFn(e.r.x, e.r.y, radius, lineWidth);

  var color = [.6, 1, .3];  // [unlocked, locked, won]
  var colorRatio = _.interpolate(color, ratio);
  this.textCtx_.strokeStyle = _.generateGray(colorRatio);
  this.textCtx_.stroke();

  var fill = [0, 0, 1];  // [unlocked, locked, won]
  var fillRatio = _.interpolate(fill, ratio);
  drawFn(e.r.x, e.r.y, radius, 0, fillRatio);
  this.textCtx_.fillStyle = this.textCtx_.strokeStyle;
  this.textCtx_.fill();

  // Draw stage connections.
  _.each(e.unlocks, function(stage) {
    var to = this.getPos_(stage.r.element);
    var a = _.angle(e.r, to);
    this.line_(e.r.x + radius * Math.cos(a),
               e.r.y + radius * Math.sin(a),
               to.x - radius * Math.cos(a),
               to.y - radius * Math.sin(a),
               1);
  }, this);
};

Renderer.prototype.drawItem_ = function(e) {
  // DEBUG: Draw item box.
  //this.textCtx_.fillStyle = 'rgba(0, 255, 0, .5)';
  //this.textCtx_.strokeStyle = 'rgba(50, 50, 50, .5)';
  //this.textCtx_.lineWidth = 2;
  //this.fillRect_(e.r.x, e.r.y, e.size, e.size);
  //this.strokeRect_(e.r.x, e.r.y, e.size, e.size);

  this.drawItemBorder_(e);
  var options = {rotation: -Math.PI / 2, alpha: e.alpha};

  // Fade if on cooldown or jammed.
  var cdRatio;
  if (e.cdInfo) {
    cdRatio =
        (e.cdInfo.cooldownRemaining - (this.gm_.time - this.gm_.actTime)) /
        e.cdInfo.initCooldown;
    if (cdRatio < 0) cdRatio = 0;
    if (cdRatio > 0 || e.cdInfo.jammed) options.alpha *= .25;
  } else {
    // Drawing non-battle item.
    options.ctx = 'text';
  }

  // Draw as faded if not equipped.
  if (e.style == 'unequipped') {
    options.alpha *= .5;
  }

  this.spriteService_.draw(
      e.item.name, e.r.x + e.size / 2, e.r.y + e.size / 2, options);

  // Draw cooldown.
  if (e.cdInfo) {
    this.ctx_.fillStyle = Gfx.Color.COOLDOWN;
    var offset = this.spriteService_.getSize(e.item.name) -
          this.spriteService_.getActualSize(e.item.name);
    this.ctx_.fillRect(e.r.x + offset / 2,
                       e.r.y + offset / 2 + (e.size - offset) * (1 - cdRatio),
                       e.size - offset, (e.size - offset) * cdRatio);
  }
};

Renderer.prototype.drawItemBorder_ = function(e) {
  // TODO.
};

Renderer.prototype.drawShipElement_ = function(e) {
  this.spriteService_.draw(
      e.hull.spec.sprite, e.r.x + e.size / 2, e.r.y + e.size / 2,
      {rotation: e.rotation, alpha: e.alpha});
};

Renderer.prototype.drawLabel_ = function(e) {
  if (e.style == 'hidden') return;
  var bgColor = this.getBgColor_(e.bgStyle);
  if (bgColor) {
    this.textCtx_.fillStyle = bgColor;
    this.fillRect_(e.r.x - e.bgMargin.left, e.r.y - e.bgMargin.top,
                   e.width + e.bgMargin.left + e.bgMargin.right,
                   e.height + e.bgMargin.top + e.bgMargin.bottom);
  }

  var fgColor = this.getFgColor_(e.style);
  for (var i = 0; i < e.lines.length; i++) {
    this.textCtx_.textAlign = 'left';
    this.textCtx_.textBaseline = 'top';
    this.drawText_(
        e.lines[i], e.size, e.r.x, e.r.y + i * e.lineHeight, {color: fgColor});
  };
};

// UiElement helper functions.

Renderer.prototype.drawText_ = function(text, size, x, y, opt_options) {
  var offset = this.textService_.offset(size);
  var options = opt_options || {};
  var color = options.color || Gfx.Color.FG;
  this.textCtx_.fillStyle = color;
  this.textCtx_.shadowBlur = 0;
  this.setFont_(size, Gfx.Font.TEXT, options.bold);
  this.fillText_(text, x + offset.x, y + offset.y);
};

Renderer.prototype.line_ = function(x1, y1, x2, y2, lineWidth) {
  x1 = x1 * this.screen_.upscale;
  y1 = y1 * this.screen_.upscale;
  x2 = x2 * this.screen_.upscale;
  y2 = y2 * this.screen_.upscale;
  if (lineWidth) {
    lineWidth = lineWidth * this.screen_.upscale;
    this.textCtx_.lineWidth = lineWidth;
  }
  this.textCtx_.beginPath();
  this.textCtx_.moveTo(x1, y1);
  this.textCtx_.lineTo(x2, y2);
  this.textCtx_.stroke();
};

Renderer.prototype.square_ = function(x, y, radius, opt_lineWidth, opt_ratio) {
  var ratio = opt_ratio === undefined ? 1 : opt_ratio;
  var lineWidth = opt_lineWidth === undefined ? 1 : opt_lineWidth;
  x = x * this.screen_.upscale;
  y = y * this.screen_.upscale;
  radius = radius * this.screen_.upscale;
  if (lineWidth) {
    lineWidth = lineWidth * this.screen_.upscale;
    this.textCtx_.lineWidth = lineWidth;
  } else lineWidth = 0;
  this.textCtx_.beginPath();
  this.textCtx_.moveTo(x - radius, y - radius);
  this.textCtx_.lineTo(x + radius, y - radius);
  this.textCtx_.lineTo(x + radius, y - radius + radius * 2 * ratio);
  this.textCtx_.lineTo(x - radius, y - radius + radius * 2 * ratio);
  this.textCtx_.closePath();
};

Renderer.prototype.circle_ = function(x, y, radius, opt_lineWidth, opt_ratio) {
  var ratio = opt_ratio === undefined ? 1 : opt_ratio;
  var lineWidth = opt_lineWidth === undefined ? 1 : opt_lineWidth;
  x = x * this.screen_.upscale;
  y = y * this.screen_.upscale;
  radius = radius * this.screen_.upscale;
  if (lineWidth) {
    lineWidth = lineWidth * this.screen_.upscale;
    this.textCtx_.lineWidth = lineWidth;
  } else lineWidth = 0;
  this.textCtx_.beginPath();
  this.textCtx_.arc(x, y, radius - lineWidth / 2,
                    -Math.PI / 2 - Math.PI * ratio,
                    -Math.PI / 2 + Math.PI * ratio);
};

Renderer.prototype.fillRect_ = function(x, y, width, height) {
  x = x * this.screen_.upscale;
  y = y * this.screen_.upscale;
  width = width * this.screen_.upscale;
  height = height * this.screen_.upscale;
  this.textCtx_.fillRect(x, y, width, height);
};

Renderer.prototype.strokeRect_ = function(x, y, width, height) {
  x = x * this.screen_.upscale;
  y = y * this.screen_.upscale;
  width = width * this.screen_.upscale;
  height = height * this.screen_.upscale;
  this.textCtx_.strokeRect(x, y, width, height);
};

Renderer.prototype.setFont_ = function(size, face, bold) {
  size = size * this.screen_.upscale;
  this.textCtx_.font = (bold ? 'bold ' : '') + size + 'px ' + face;
};

Renderer.prototype.strokeText_ = function(text, x, y) {
  x = x * this.screen_.upscale;
  y = y * this.screen_.upscale;
  this.textCtx_.strokeText(text, x, y);
};

Renderer.prototype.fillText_ = function(text, x, y) {
  x = x * this.screen_.upscale;
  y = y * this.screen_.upscale;
  this.textCtx_.fillText(text, x, y);
};

Renderer.prototype.getFgColor_ = function(style) {
  switch (style) {
    case 'muted': return Gfx.Color.FG_MUTED;
    case 'active': return Gfx.Color.FG_ACTIVE;
  }
  return Gfx.Color.FG;
};

Renderer.prototype.getBgColor_ = function(style) {
  switch (style) {
    case 'muted': return Gfx.Color.BG_MUTED;
    case 'muted_dark': return Gfx.Color.BG_MUTED_DARK;
    case 'pressed': return Gfx.Color.BG_PRESSED;
    case 'primary': return Gfx.Color.BG;
  }
  return '';
};

// Battle entity draw functions.

var DEATH_ANIMATION_DURATION = .3;
Renderer.prototype.initShip_ = function(e) {
  e.r.damageTaken = 0;
  e.r.shaking = 0;
  e.r.healthIndicator = 0;
  e.r.deathAnimation = DEATH_ANIMATION_DURATION;
  e.r.radius = e.radius;
};
Renderer.prototype.addShipStyle_ = function(style) {
  style.normal = this.gfx_.addStyle({
    shadow: 'none'
  });
  style.dmged = this.gfx_.addStyle({
    shadow: Gfx.Color.RED,
    shadowBlur: 5
  });
  style.disabled = this.gfx_.addStyle({
    shadow: Gfx.Color.BLUE,
    shadowBlur: 5
  });
  style.ability = this.gfx_.addStyle({
    shadow: Gfx.Color.OPAC_ORANGE,
    shadowBlur: 7
  });
  style.tagged = this.gfx_.addStyle({
    stroke: Gfx.Color.OPAC_RED,
    lineWidth: 2,
    shadow: Gfx.Color.BLACK,
    shadowBlur: 2,
    layer: 6
  });
  style.shield = this.gfx_.addStyle({
    lineWidth: 1,
    stroke: Gfx.Color.MORE_OPAC_BLUE
  });
  style.reflect = this.gfx_.addStyle({
    lineWidth: 1,
    stroke: Gfx.Color.OPAC_YELLOW
  });
  style.haze = this.gfx_.addStyle({
    fill: Gfx.Color.OPAC_GRAY
  });
};
Renderer.prototype.drawShip_ = function(e, style, dt) {
  // Shake afer taking damage.
  if (e.r.lastDamageTaken != this.gm_.tick) {
    e.r.lastDamageTaken = this.gm_.tick;
    var damage = e.prevHealth - e.health;
    e.r.damageTaken += damage;
    if (damage > 0) {
      e.r.shaking += Math.sqrt(damage) / 20;
    }
  }
  if (e.r.shaking > 0 && !e.frozen) {
    var shake = 2 + e.r.damageTaken / 2;
    e.r.damageTaken -= 20 * dt / this.gm_.gameSpeed;
    e.r.x += (.3 + .7 * Math.random()) * shake;
    e.r.y += (.3 + .7 * Math.random()) * shake;
    e.r.shaking -= dt / this.gm_.gameSpeed;
    if (e.r.shaking <= 0) {
      e.r.shaking = 0;
      e.r.damageTaken = 0;
    }
  }

  var customStyle;
  var shipStyle = style.normal;

  if (!e.dead) {
    // Don't resize instantly.
    var rGap = e.radius - e.r.radius;
    if (rGap) {
      var dr = Math.sign(rGap) * 10 * dt;
      if (Math.abs(rGap) < Math.abs(dr)) {
        e.r.radius = e.radius;
      } else {
        e.r.radius += dr;
      }
    }

    // Draw tagged indicator.
    if (e.effect.tagged) {
      this.gfx_.setStyle(style.tagged);
      this.gfx_.circle(e.r.x, e.r.y, 3);
    }

    // Draw shield indicator.
    if (e.effect.shield) {
      this.gfx_.setStyle(style.shield);
      this.gfx_.circle(e.r.x, e.r.y, e.radius * 1.5);
    }

    // Draw reflect indicator.
    if (e.effect.reflect) {
      this.gfx_.setStyle(style.reflect);
      this.gfx_.circle(e.r.x, e.r.y, e.radius * 1.5);
    }

    // Draw haze indicator.
    if (e.effect.haze) {
      this.gfx_.setStyle(style.haze);
      this.gfx_.circle(e.r.x, e.r.y, e.radius * 1.5);
    }

    // Draw disabled indicator.
    if (e.effect.disabled) {
      shipStyle = style.disabled;
    }

    // Draw disabled indicator.
    if (e.secondary.charging) {
      shipStyle = style.ability;
    }

    // Draw charge laser charging animation.
    if (e.primary.charge) {
      var r = .2 + .8 * e.primary.charge / e.primary.chargeTime;
      customStyle = {
        shadow: 'rgba(255, 255, 50, ' + r + ')',
        shadowBlur: r * 20
      };
      shipStyle = style.ability;
    }

    // Draw health indicator.
    if (e.health <= 10 && damage) {
      e.r.healthIndicator = 30;
    }
    if (e.r.healthIndicator) {
      shipStyle = style.dmged;
      e.r.healthIndicator--;
    }

    if (e.effect.exiled) {
      customStyle = {globalAlpha: 0};
    } else if (e.effect.invisible) {
      customStyle = {globalAlpha: .4};
    }

  } else {
    // Death animation.
    if (e.dead) {
      customStyle = {
        globalAlpha: e.r.deathAnimation / DEATH_ANIMATION_DURATION
      };
      e.r.deathAnimation -= dt;
      if (e.r.deathAnimation < 0) e.r.deathAnimation = 0;
    }
  }

  // Draw ship.
  this.gfx_.setStyle(shipStyle, customStyle);
  this.gfx_.image(e.hull.sprite, e.r.x, e.r.y, e.rotation, e.r.radius);

  // DEBUG: See the hit box of the ship.
  //this.gfx_.setStyle(style.reflect);
  //this.gfx_.circle(e.r.x, e.r.y, e.r.radius);

  // DEBUG: See where the ship is aiming.
  //var dx = e.r.x - e.x;
  //var dy = e.r.y - e.y;
  //if (e.aimPos) {
  //  this.gfx_.circle(e.aimPos.x + dx, e.aimPos.y + dy, 3);
  //}
  //if (e.utility.teleportPos) {
  //  this.gfx_.circle(e.utility.teleportPos.x + dx,
  //                   e.utility.teleportPos.y + dy, 3);
  //}
};

var SPEED_FUDGING = 8;  // Draw laser ahead of where it actually is.
Renderer.prototype.addLaserStyle_ = function(style) {
  style.strong = this.gfx_.addStyle({
    stroke: Gfx.Color.YELLOW,
    lineWidth: 3
  });
  style.weak = this.gfx_.addStyle({
    stroke: Gfx.Color.RED,
    lineWidth: 3
  });
  style.effect = this.gfx_.addStyle({
    stroke: Gfx.Color.PINK,
    lineWidth: 4
  });
  style.alien = this.gfx_.addStyle({
    stroke: Gfx.Color.PURPLE,
    lineWidth: 3
  });
};
Renderer.prototype.drawLaser_ = function(e, style) {
  if (e.dead) {
    e.remove = true;
    return;
  }

  this.gfx_.setStyle(style[e.style || 'strong']);
  var dx = Math.cos(e.rotation) * SPEED_FUDGING;
  var dy = Math.sin(e.rotation) * SPEED_FUDGING;
  this.gfx_.line(e.r.x + dx, e.r.y + dy, e.dx - dx * 2, e.dy - dy * 2);
};

var EXPLOSION_DURATION = .05;
var NORMAL_SIZE = .2;
Renderer.prototype.addBombStyle_ = function(style) {
  style.normal = this.gfx_.addStyle({
    stroke: Gfx.Color.BLUE,
    lineWidth: 1
  });
  style.effect = this.gfx_.addStyle({
    stroke: Gfx.Color.PINK,
    lineWidth: 1
  });
  style.alien = this.gfx_.addStyle({
    fill: Gfx.Color.PURPLE
  });
  style.normalExplode = this.gfx_.addStyle({
    fill: Gfx.Color.YELLOW
  });
  style.effectExplode = this.gfx_.addStyle({
    fill: Gfx.Color.BLUE
  });
  style.alienExplode = this.gfx_.addStyle({
    fill: Gfx.Color.PINK
  });
};
Renderer.prototype.drawBomb_ = function(e, style, dt) {
  if (e.remove) return;
  if (e.dead) {
    // Draw explosion.
    if (!_.isDef(e.r.explodeTime)) {
      e.r.explodeTime = 0;
    }

    e.r.explodeTime += dt;
    var ratio = Math.min(e.r.explodeTime / EXPLOSION_DURATION, 1);
    this.gfx_.setStyle(style[(e.style || 'normal') + 'Explode']);
    this.gfx_.circle(e.r.x, e.r.y, Math.pow(ratio, 2) * e.radius);

    if (ratio == 1) e.remove = true;
  } else {
    this.gfx_.setStyle(style[e.style || 'normal']);
    this.gfx_.circle(e.r.x, e.r.y, e.radius * NORMAL_SIZE);
  }
};

Renderer.prototype.addBallStyle_ = function(style) {
  style.normal = this.gfx_.addStyle({
    fill: Gfx.Color.GRAY
  });
};
Renderer.prototype.drawBall_ = function(e, style, dt) {
  if (e.dead) {
    e.remove = true;
    return;
  }
  this.gfx_.setStyle(style.normal);
  this.gfx_.circle(e.r.x, e.r.y, e.radius);
};

Renderer.prototype.addAuraStyle_ = function(style) {
  style.normal = this.gfx_.addStyle({
    stroke: Gfx.Color.OPAC_WHITE,
    lineWidth: 16
  });
};
Renderer.prototype.drawAura_ = function(e, style, dt) {
  if (e.dead) {
    e.remove = true;
    return;
  }
  this.gfx_.setStyle(style.normal);
  this.gfx_.circle(e.r.x, e.r.y, e.radius);

};

Renderer.prototype.addBladeStyle_ = function(style) {
  style.normal = this.gfx_.addStyle({
    stroke: Gfx.Color.BLUE,
    lineWidth: 2
  });
  style.alien = this.gfx_.addStyle({
    stroke: Gfx.Color.PURPLE,
    lineWidth: 2
  });
};
Renderer.prototype.drawBlade_ = function(e, style, dt) {
  if (e.dead) {
    e.remove = true;
    return;
  }
  var triangle = _.geometry.circumscribeTriangle(
      e.r.x, e.r.y, e.radius - 1, e.rotation);
  this.gfx_.setStyle(style[e.style || 'normal']);
  this.gfx_.triangle(triangle.x1, triangle.y1,
                     triangle.x2, triangle.y2,
                     triangle.x3, triangle.y3);

};
