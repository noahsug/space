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
  this.transitionAnimation_ = 0;
};

Renderer.prototype.update = function(dt) {
  this.handleCamera_(dt / this.gm_.gameSpeed);
  this.background_.draw();
  for (var i = 0; i < this.gm_.entities.length; i++) {
    this.drawEntity_(this.gm_.entities.arr[i], dt);
  }
  this.gfx_.flush();
  //this.drawFps_(dt);
  this.drawTransition_(dt);
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

Renderer.prototype.drawTransition_ = function(dt) {
  if (!this.gm_.transition.done) {
    this.transitionOut_(dt);
  } else if (this.transitionAnimation_) {
    this.transitionIn_(dt);
  }
};

Renderer.prototype.transitionOut_ = function(dt) {
  var x = this.gm_.transition.pos.screenX;
  var y = this.gm_.transition.pos.screenY;
  this.transitionAnimation_ += 450 * (dt / this.gm_.transition.time);
  this.textCtx_.fillStyle = '#000000';
  this.circle_(x, y, this.transitionAnimation_);
  this.textCtx_.fill();
};

Renderer.prototype.transitionIn_ = function(dt) {
  if (this.transitionAnimation_ > 1) this.transitionAnimation_ = 1;
  var fade = this.gm_.transition.time * 2;
  var ease = (1.1 - this.transitionAnimation_) * 8;
  this.transitionAnimation_ -= ease * dt / fade;

  if (this.transitionAnimation_ < 0) {
    this.transitionAnimation_ = 0;
  } else {
    this.textCtx_.fillStyle =
        "rgba(0, 0, 0, " + this.transitionAnimation_ + ")";
    this.fillRect_(0, 0, this.screen_.width, this.screen_.height);
  }
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

Renderer.prototype.drawResultSplash_ = function(e) {
  this.textCtx_.textAlign = 'left';
  this.textCtx_.textBaseline = 'top';
  var result = this.gm_.stage.state == 'won' ? 'victory' : 'defeat';
  this.drawText_(result, 70, e.r.x, e.r.y);
};

Renderer.prototype.drawPlayerSplash_ = function(e) {
  this.spriteService_.draw(
      this.inventory_.getHull().spec.sprite,
      this.screen_.width / 2, e.r.y,
      {rotation: -Math.PI / 2});
};

Renderer.prototype.drawEnemySplash_ = function(e) {
  this.spriteService_.draw(
      this.gm_.stage.hull.spec.sprite,
      this.screen_.width / 2, e.r.y,
      {rotation: Math.PI / 2});
};

Renderer.prototype.drawWonSplash_ = function() {
  this.textCtx_.textAlign = 'center';
  this.textCtx_.textBaseline = 'alphabetic';
  var text = _.last(this.gm_.world.missions) == this.gm_.mission ?
      'You Win' : 'Mission Clear';
  this.drawText_(text, Size.TITLE,
                  this.screen_.width / 2, this.screen_.height / 2);
};

Renderer.prototype.drawLostSplash_ = function() {
  this.textCtx_.textAlign = 'center';
  this.textCtx_.textBaseline = 'alphabetic';
  this.drawText_('Mission Failed', Size.TITLE,
                  this.screen_.width / 2, this.screen_.height / 2);
};

var DESC_ONLY = _.newSet([
  'charge', 'tracker', 'pull', 'turret', 'alien spawn'
]);
Renderer.prototype.drawItemDesc_ = function(e) {
  var size = Size.TEXT;
  var padding = Padding.TEXT / 2;
  if (!e.item) return;
  this.textCtx_.textAlign = 'left';
  this.textCtx_.textBaseline = 'middle';

  var tier = Game.MAX_ITEM_LEVEL - e.item.level + 1;
  var desc = e.item.desc;

  var textLines = [desc];
  var type = e.item.category;
  if ((type == 'primary' || type == 'secondary') &&
      !(e.item.name in DESC_ONLY)) {
    var spec = e.item.spec;
    var dps = spec.dmg / spec.cooldown;
    var stats = 'DPS: ' + dps.toFixed(1);
    if (spec.projectiles > 1) stats += ' x' + spec.projectiles;
    stats += '  Range: ' + spec.range / 10;
    if (spec.seek > 10) stats += '  Seek: ' + spec.seek.toFixed(1);
    textLines[1] = stats;
  }

  var width = this.textService_.width(desc, size);
  if (width > this.screen_.width - e.r.x * 2) {
    if (textLines[1]) desc += ' ' + textLines[1];
    textLines = _.splitText(desc);
  }

  if (textLines.length == 2) {
    this.drawText_(textLines[0], size, e.r.x,
                   e.r.y - size / 2 - padding);
    this.drawText_(textLines[1], size, e.r.x,
                   e.r.y + size / 2 + padding);
  } else {
    this.drawText_(textLines[0], size,
                   e.r.x, e.r.y);
  }
};

Renderer.prototype.drawBreak_ = function(e) {
  this.textCtx_.strokeStyle = '#CCC';
  this.textCtx_.shadowBlur = 0;
  var x = this.screen_.width / 8;
  var y = e.r.y;
  this.line_(this.screen_.width - x, y, x, y, 1);
};

Renderer.prototype.drawRoundBtn_ = function(e) {
  if (e.style == 'hidden') return;

  // Draw circle.
  var color = '#FFFFFF';
  var fillColor = '#000000';
  var lineWidth = 1;
  if (e.stage) {
    if (e.stage.state == 'won' || e.stage.state == 'lost') {
      return;
    }
    fillColor = '';
    color = e.stage.state == 'locked' ? '' : '#888';
  } else if (e.mission) {
    switch (e.mission.state) {
      case 'won': color = Gfx.Color.BEATEN; break;
      case 'locked': color = Gfx.Color.LOCKED; break;
    }
  } else if (e.item) {
    if (e.rewardBtn) {
      if (!e.item.name) color = Gfx.Color.LOCKED;
      if (e.style == 'active') color = Gfx.Color.ACTIVE;
    } else if (e.enemy) {
      if (e.style == 'active') color = Gfx.Color.ACTIVE_LOCKED;
      else color = Gfx.Color.LOCKED;
    } else if (!this.inventory_.has(e.item.category)) {
      color = Gfx.Color.LOCKED;
    } else if (e.style == 'equipped' || e.style == 'active') {
      color = Gfx.Color.ACTIVE;
    }
  } else if (e.category) {
    if (!this.inventory_.has(e.category)) {
      color = Gfx.Color.LOCKED;
    } else if (e.style != 'selected') {
      color = Gfx.Color.UNSELECTED;
    }
  } else if (e.style == 'locked') {
    color = Gfx.Color.LOCKED;
  }

  this.textCtx_.fillStyle = fillColor;
  this.textCtx_.strokeStyle = color;
  this.circle_(
      e.r.x, e.r.y, e.radius, lineWidth);
  if (fillColor) this.textCtx_.fill();
  if (color) this.textCtx_.stroke();

  // Draw context.
  var text = e.text;
  var textSize = Size.ITEM_TEXT;
  if (e.stage) {
    var hull = e.stage.hull.spec.sprite;
    var rotation = e.stage.enemy ? Math.PI / 2 : -Math.PI / 2;
    var alpha = e.stage.state == 'locked' ? .3 : 0;
    this.spriteService_.draw(
      hull, e.r.x, e.r.y,
      {rotation: rotation, alpha: alpha});
    return;
  } else if (e.mission) {
    if (e.state == 'won') text = 'W';
    else text = e.mission.index + 1;
    textSize = Size.MISSION_TEXT;
  } else if (e.item) {
    if (e.enemy && e.item.name) {
      color = '#FFFFFF';
    }
    text = e.item.displayName || 'none';
    textSize = Size.ITEM_TEXT;
  } else if (e.category) {
    text = Strings.ItemType[e.category];
  }

  this.textCtx_.textAlign = 'center';
  this.textCtx_.textBaseline = 'middle';
  if (this.textService_.width(text, textSize) > e.radius * 2 - 6) {
    var lines = _.splitText(text);
    this.drawText_(lines[0], textSize, e.r.x,
                   e.r.y - textSize / 2 - 2, {color: color});
    this.drawText_(lines[1], textSize, e.r.x,
                   e.r.y + textSize / 2 + 2, {color: color});
  } else {
    this.drawText_(text, textSize, e.r.x, e.r.y, {color: color});
  }

  if (e.cooldownInfo) {
    var spec = e.cooldownInfo;
    var cooldownRatio =
        (spec.cooldown - spec.cooldownRemaining) / spec.cooldown;
    if (cooldownRatio < 0) cooldownRatio = 0;
    else if (cooldownRatio > 1) cooldownRatio = 1;
    lineWidth = !spec.jammed && cooldownRatio == 1 ? 4 : 2;
    this.textCtx_.strokeStyle = Gfx.Color.ACTIVE;
    this.circle_(e.r.x, e.r.y, e.radius, lineWidth, cooldownRatio);
    this.textCtx_.stroke();
  }
};

Renderer.prototype.drawBackdrop_ = function(e) {
  var bgColor = 'rgba(0, 0, 0, .65)';
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

Renderer.prototype.drawItem_ = function(e) {
  // DEBUG: Draw item box.
  //this.textCtx_.fillStyle = 'rgba(0, 255, 0, .5)';
  //this.textCtx_.strokeStyle = 'rgba(50, 50, 50, .5)';
  //this.textCtx_.lineWidth = 2;
  //this.fillRect_(e.r.x, e.r.y, e.size, e.size);
  //this.strokeRect_(e.r.x, e.r.y, e.size, e.size);

  if (e.style == 'hidden') return;
  this.drawItemBorder_(e);
  if (e.stage) this.drawStageItem_(e);
  if (e.item) this.drawEquipItem_(e);
};

Renderer.prototype.drawItemBorder_ = function(e) {
  // TODO.
};

Renderer.prototype.drawStageItem_ = function(e) {
  var hull = e.stage.hull.spec.sprite;
  var rotation = e.stage.enemy ? Math.PI / 2 : -Math.PI / 2;
  var alpha = (e.stage.state == 'locked' ? .3 : 1) * e.alpha;
  this.spriteService_.draw(
      hull, e.r.x + e.size / 2, e.r.y + e.size / 2,
      {rotation: rotation, alpha: alpha});
};

Renderer.prototype.drawEquipItem_ = function(e) {
  if (!e.item.name) return;

  var options = {rotation: -Math.PI / 2};

  // Draw cooldown.
  if (e.cdInfo) {
    var cdRatio =
        (e.cdInfo.cooldownRemaining - (this.gm_.time - this.gm_.actTime)) /
        e.cdInfo.initCooldown;
    if (cdRatio < 0) cdRatio = 0;
    this.textCtx_.fillStyle = Gfx.Color.COOLDOWN;
    this.fillRect_(e.r.x, e.r.y + e.size * (1 - cdRatio),
                   e.size, e.size * cdRatio);
    if (cdRatio > 0 || e.cdInfo.jammed) options.alpha = .75;
  } else {
    options.ctx = 'text';
  }

  // Draw as faded if not equipped.
  if (e.style == 'unequipped') {
    options.alpha = .5;
  }

  this.spriteService_.draw(
      e.item.name, e.r.x + e.size / 2, e.r.y + e.size / 2, options);
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
  if (e.r.shaking > 0) {
    var shake = 2 + e.r.damageTaken / 2;
    e.r.damageTaken -= 20 * dt;
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

    // Draw health indicator.
    if (e.health <= 10 && damage) {
      e.r.healthIndicator = 30;
    }
    if (e.r.healthIndicator) {
      shipStyle = style.dmged;
      e.r.healthIndicator--;
    }

    if (e.effect.invisible) {
      customStyle = {};
      customStyle.globalAlpha = .4;
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

Renderer.prototype.drawText_ = function(text, size, x, y, opt_options) {
  var offset = this.textService_.offset(size);
  var options = opt_options || {};
  var color = options.color || Gfx.Color.FG;
  this.textCtx_.fillStyle = color;
  this.textCtx_.shadowBlur = 0;
  this.setFont_(size, Gfx.Font.TEXT, options.bold);
  this.fillText_(text, x + offset.x, y + offset.y);
};

// NOT USED.
Renderer.prototype.underlineLabel_ = function(e, opt_options) {
  var options = opt_options || {};
  options.color = '#FFFFFF';
  if (e.style == 'equipped' || e.style == 'active') {
    options.color = Gfx.Color.ACTIVE;
  }
  options.lineDirection = e.lineDirection;
  this.underlineText_(e.text, e.size, e.r.x, e.r.y, options);
};

// NOT USED.
Renderer.prototype.underlineText_ = function(text, size, x, y, opt_options) {
  var lineWidth = 1;
  var options = opt_options || {};
  options.color = options.color || '#FFFFFF';
  options.lineDirection = options.lineDirection || 'right';
  y += size + 5;
  this.textCtx_.strokeStyle = options.color;

  if (options.lineDirection == 'right') {
    this.line_(x, y, x + this.screen_.width, y, lineWidth);
  } else {
    var width = this.textService_.width(text, size);
    this.line_(x + width, y, 0, y, lineWidth);
  }
};

// NOT USED.
Renderer.prototype.circleText_ = function(e) {
  // TODO: This is currently dependant on text length.
  this.ctx_.shadowBlur = 2;
  this.ctx_.lineWidth = 2;
  this.ctx_.strokeStyle = this.ctx_.shadowColor = '#FFFFFF';
  this.ctx_.fillStyle = '#000000';
  var width = this.textService_.width(e.text, e.size);
  var endPadding = e.size * 1.4;
  var topPadding = e.size * 1;
  var y = e.r.y + e.size / 10;
  var x = e.r.x - width / 2 - endPadding;
  var x2 = x + width + endPadding * 2;

  this.ctx_.beginPath();
  this.ctx_.arc(x, y, topPadding, Math.PI / 2, -Math.PI / 2);
  this.ctx_.lineTo(x2, y - topPadding);
  this.ctx_.arc(x2, y, topPadding, -Math.PI / 2, Math.PI / 2);
  this.ctx_.lineTo(x, y + topPadding);

  this.ctx_.fill();
  this.ctx_.stroke();
};

// TextCtx draw functions.

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

Renderer.prototype.circle_ = function(x, y, radius, lineWidth, opt_ratio) {
  var ratio = opt_ratio === undefined ? 1 : opt_ratio;
  x = x * this.screen_.upscale;
  y = y * this.screen_.upscale;
  radius = radius * this.screen_.upscale;
  if (lineWidth) {
    lineWidth = lineWidth * this.screen_.upscale;
    this.textCtx_.lineWidth = lineWidth;
  } else lineWidth = 0;
  this.textCtx_.beginPath();
  this.textCtx_.arc(x, y, radius - lineWidth / 2,
                    0, 2 * Math.PI * ratio);
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
    case 'primary': return Gfx.Color.BG;
  }
  return '';
};
