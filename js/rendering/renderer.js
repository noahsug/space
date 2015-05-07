var Renderer = di.service('Renderer', [
  'GameModel as gm', 'Screen', 'ctx', 'textCtx', 'Gfx', 'Background', 'Font',
  'ItemService', 'Inventory', 'SpriteService']);

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

var INTRO_SCROLL_SPEED = 16;
Renderer.prototype.handleCamera_ = function(dt) {
  if (this.gm_.scenes['battle'] != 'inactive' ||
      this.gm_.scenes['loading'] != 'inactive') {
    return;
  }
  this.screen_.x -= INTRO_SCROLL_SPEED * dt;
  this.screen_.y -= INTRO_SCROLL_SPEED * dt;
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
  var fade = this.gm_.scenes.intro == 'active' ? 4 :
      this.gm_.transition.time * 2;
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

Renderer.prototype.drawEntity_ = function(entity, dt) {
  if (!entity.render) {
    entity.render = {};
    this.initFns_[entity.type] && this.initFns_[entity.type](entity);
  }
  entity.render.pos = this.getPos_(entity);
  this.drawFns_[entity.type](entity, this.style_[entity.type], dt);
};

Renderer.prototype.getPos_ = function(entity) {
  if (entity.staticPosition) {
    return this.screen_.screenToDraw(entity.screenX, entity.screenY);
  } else {
    return this.screen_.canvasToDraw(entity.x, entity.y);
  }
};

Renderer.prototype.drawLoadingSplash_ = function(entity) {
  this.ctx_.font = 10 + 'px ' + Gfx.Font.TITLE;
  this.ctx_.fillText('.', 0, 0);
  this.ctx_.font = 10 + 'px ' + Gfx.Font.TEXT;
  this.ctx_.fillText('.', 0, 0);

  this.ctx_.fillStyle = '#000000';
  this.ctx_.fillRect(0, 0, this.screen_.width, this.screen_.height);

  var x = this.screen_.width / 2;
  var y = this.screen_.height / 2;
  this.ctx_.shadowBlur = 25;
  this.ctx_.lineWidth = 5;
  this.ctx_.strokeStyle = this.ctx_.shadowColor = '#FFFFFF';
  this.ctx_.beginPath();
  this.ctx_.arc(x, y, x / 2, -Math.PI / 2,
                -Math.PI / 2 + 2 * Math.PI * entity.loading);
  this.ctx_.stroke();
  this.ctx_.shadowBlur = 0;
};

Renderer.prototype.drawIntroSplash_ = function() {
  var fontSize = 70;
  this.textCtx_.textAlign = 'center';
  this.textCtx_.textBaseline = 'alphabetic';
  this.drawTitle_('COSMAL', fontSize,
                  this.screen_.width / 2, this.screen_.height / 2);
};

Renderer.prototype.drawResultSplash_ = function(entity) {
  this.textCtx_.textAlign = 'left';
  this.textCtx_.textBaseline = 'top';
  var result = this.gm_.stage.state == 'won' ? 'victory' : 'defeat';
  this.drawTitle_(result, 70, entity.render.pos.x, entity.render.pos.y);
};

Renderer.prototype.drawPlayerSplash_ = function(entity) {
  this.spriteService_.draw(
      this.inventory_.getHull().spec.sprite,
      this.screen_.width / 2, entity.render.pos.y,
      {rotation: -Math.PI / 2});
};

Renderer.prototype.drawEnemySplash_ = function(entity) {
  this.spriteService_.draw(
      this.gm_.stage.hull.spec.sprite,
      this.screen_.width / 2, entity.render.pos.y,
      {rotation: Math.PI / 2});
};

Renderer.prototype.drawWonSplash_ = function() {
  this.textCtx_.textAlign = 'center';
  this.textCtx_.textBaseline = 'alphabetic';
  var text = _.last(this.gm_.worlds) == this.gm_.world ?
      'You Win' : 'World Clear';
  this.drawTitle_(text, Size.TITLE,
                  this.screen_.width / 2, this.screen_.height / 2);
};

Renderer.prototype.drawLostSplash_ = function() {
  this.textCtx_.textAlign = 'center';
  this.textCtx_.textBaseline = 'alphabetic';
  this.drawTitle_('World Failed', Size.TITLE,
                  this.screen_.width / 2, this.screen_.height / 2);
};

var DESC_ONLY = _.newSet([
  'charge', 'charge II', 'tracker', 'tracker II', 'pull', 'melee',
]);
Renderer.prototype.drawItemDesc_ = function(entity) {
  var size = Size.TEXT;
  var padding = Padding.TEXT / 2;
  if (!entity.item) return;
  this.textCtx_.textAlign = 'left';
  this.textCtx_.textBaseline = 'middle';

  var tier = Game.MAX_ITEM_LEVEL - entity.item.level + 1;
  var desc = entity.item.desc;

  var textLines = [desc];
  var type = entity.item.category;
  if ((type == 'primary' || type == 'secondary') &&
      !(entity.item.name in DESC_ONLY)) {
    var spec = entity.item.spec;
    var dps = spec.dmg / spec.cooldown;
    var stats = 'DPS: ' + dps.toFixed(1);
    if (spec.projectiles > 1) stats += ' x' + spec.projectiles;
    stats += '  Range: ' + spec.range / 10;
    if (spec.seek > 10) stats += '  Seek: ' + spec.seek.toFixed(1);
    textLines[1] = stats;
  }

  var width = this.font_.width(desc, size);
  if (width > this.screen_.width - entity.render.pos.x * 2) {
    if (textLines[1]) desc += ' ' + textLines[1];
    textLines = _.splitText(desc);
  }

  if (textLines.length == 2) {
    this.drawText_(textLines[0], size, entity.render.pos.x,
                   entity.render.pos.y - size / 2 - padding);
    this.drawText_(textLines[1], size, entity.render.pos.x,
                   entity.render.pos.y + size / 2 + padding);
  } else {
    this.drawText_(textLines[0], size,
                   entity.render.pos.x, entity.render.pos.y);
  }
};

Renderer.prototype.drawBreak_ = function(entity) {
  this.textCtx_.strokeStyle = '#CCC';
  this.textCtx_.shadowBlur = 0;
  var x = this.screen_.width / 8;
  var y = entity.render.pos.y;
  this.line_(this.screen_.width - x, y, x, y, 1);
};

// TODO: Animate stage state changes.
Renderer.prototype.drawRoundBtn_ = function(entity) {
  if (entity.style == 'hidden') return;

  // Draw circle.
  var color = '#FFFFFF';
  var fillColor = '#000000';
  var lineWidth = 1;
  if (entity.stage) {
    if (entity.stage.state == 'won' || entity.stage.state == 'lost') {
      return;
    }
    fillColor = '';
    color = entity.stage.state == 'locked' ? '#444' : '#888';
  } else if (entity.world) {
    switch (entity.world.state) {
      case 'won': color = Gfx.Color.BEATEN; break;
      case 'locked': color = Gfx.Color.LOCKED; break;
    }
  } else if (entity.item) {
    if (entity.rewardBtn) {
      if (!entity.item.name) color = Gfx.Color.LOCKED;
      if (entity.style == 'active') color = Gfx.Color.ACTIVE;
    } else if (entity.enemy) {
      if (entity.style == 'active') color = Gfx.Color.ACTIVE_LOCKED;
      else color = Gfx.Color.LOCKED;
    } else if (!this.inventory_.has(entity.item.category)) {
      color = Gfx.Color.LOCKED;
    } else if (entity.style == 'equipped' || entity.style == 'active') {
      color = Gfx.Color.ACTIVE;
    }
  } else if (entity.category) {
    if (!this.inventory_.has(entity.category)) {
      color = Gfx.Color.LOCKED;
    } else if (entity.style != 'selected') {
      color = Gfx.Color.UNSELECTED;
    }
  } else if (entity.style == 'locked') {
    color = Gfx.Color.LOCKED;
  }

  this.textCtx_.fillStyle = fillColor;
  this.textCtx_.strokeStyle = color;
  this.circle_(
      entity.render.pos.x, entity.render.pos.y, entity.radius, lineWidth);
  if (fillColor) this.textCtx_.fill();
  this.textCtx_.stroke();

  // Draw context.
  var text = entity.text;
  var textSize = Size.ITEM_TEXT;
  if (entity.stage) {
    var hull = entity.stage.hull.spec.sprite;
    var rotation = entity.stage.enemy ? Math.PI / 2 : -Math.PI / 2;
    var alpha = entity.stage.state == 'locked' ? .1 : 0;
    this.spriteService_.draw(
      hull, entity.render.pos.x, entity.render.pos.y,
      {rotation: rotation, alpha: alpha});
    return;
  } else if (entity.world) {
    if (entity.state == 'won') text = 'W';
    else text = entity.world.index + 1;
    textSize = Size.WORLD_TEXT;
  } else if (entity.item) {
    if (entity.enemy && entity.item.name) {
      color = '#FFFFFF';
    }
    text = entity.item.displayName || 'none';
    textSize = Size.ITEM_TEXT;
  } else if (entity.category) {
    text = Strings.ItemType[entity.category];
  }

  this.textCtx_.textAlign = 'center';
  this.textCtx_.textBaseline = 'middle';
  if (this.font_.width(text, textSize) > entity.radius * 2 - 6) {
    var lines = _.splitText(text);
    this.drawText_(lines[0], textSize, entity.render.pos.x,
                   entity.render.pos.y - textSize / 2 - 2,
                   {color: color});
    this.drawText_(lines[1], textSize, entity.render.pos.x,
                   entity.render.pos.y + textSize / 2 + 2,
                   {color: color});
  } else {
    this.drawText_(text, textSize, entity.render.pos.x, entity.render.pos.y,
                   {color: color});
  }

  if (entity.cooldownInfo) {
    var spec = entity.cooldownInfo;
    var cooldownRatio =
        (spec.cooldown - spec.cooldownRemaining) / spec.cooldown;
    if (cooldownRatio < 0) cooldownRatio = 0;
    else if (cooldownRatio > 1) cooldownRatio = 1;
    lineWidth = !spec.jammed && cooldownRatio == 1 ? 4 : 2;
    this.textCtx_.strokeStyle = Gfx.Color.ACTIVE;
    this.circle_(
      entity.render.pos.x, entity.render.pos.y, entity.radius, lineWidth,
      cooldownRatio);
    this.textCtx_.stroke();
  }
};

Renderer.prototype.drawBtn_ = function(entity) {
  this.underlineLabel_(entity, {direction: entity.direction});
  this.drawLabel_(entity);
};

Renderer.prototype.drawLabel_ = function(entity) {
  var color = null;
  if (entity.style == 'equipped' || entity.style == 'active') {
    color = Gfx.Color.ACTIVE;
  } else if (entity.style == 'locked') {
    color = Gfx.Color.LOCKED;
  }
  this.textCtx_.textAlign = entity.align;
  this.textCtx_.textBaseline = entity.baseline;
  this.drawText_(entity.text, entity.size,
                 entity.render.pos.x, entity.render.pos.y,
                 {color: color, bold: entity.style == 'active'});
};

Renderer.prototype.drawHitbox_ = function(entity) {
  // DEBUG.
  //this.ctx_.fillStyle = 'red';
  //this.ctx_.fillRect(entity.render.pos.x, entity.render.pos.y,
  //                   entity.width, entity.height);
};

var DEATH_ANIMATION_DURATION = .3;
Renderer.prototype.initShip_ = function(entity) {
  entity.render.damageTaken = 0;
  entity.render.shaking = 0;
  entity.render.healthIndicator = 0;
  entity.render.deathAnimation = DEATH_ANIMATION_DURATION;
  entity.render.radius = entity.radius;
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
Renderer.prototype.drawShip_ = function(entity, style, dt) {
  // Shake afer taking damage.
  if (entity.render.lastDamageTaken != this.gm_.tick) {
    entity.render.lastDamageTaken = this.gm_.tick;
    var damage = entity.prevHealth - entity.health;
    entity.render.damageTaken += damage;
    if (damage > 0) {
      entity.render.shaking += Math.sqrt(damage) / 20;
    }
  }
  if (entity.render.shaking > 0) {
    var shake = 2 + entity.render.damageTaken / 2;
    entity.render.damageTaken -= 20 * dt;
    entity.render.pos.x += (.3 + .7 * Math.random()) * shake;
    entity.render.pos.y += (.3 + .7 * Math.random()) * shake;
    entity.render.shaking -= dt / this.gm_.gameSpeed;
    if (entity.render.shaking <= 0) {
      entity.render.shaking = 0;
      entity.render.damageTaken = 0;
    }
  }

  var customStyle;
  var shipStyle = style.normal;

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

    // Draw tagged indicator.
    if (entity.effect.tagged) {
      this.gfx_.setStyle(style.tagged);
      this.gfx_.circle(entity.render.pos.x, entity.render.pos.y, 3);
    }

    // Draw shield indicator.
    if (entity.effect.shield) {
      this.gfx_.setStyle(style.shield);
      this.gfx_.circle(entity.render.pos.x, entity.render.pos.y,
                       entity.radius * 1.5);
    }

    // Draw reflect indicator.
    if (entity.effect.reflect) {
      this.gfx_.setStyle(style.reflect);
      this.gfx_.circle(entity.render.pos.x, entity.render.pos.y,
                       entity.radius * 1.5);
    }

    // Draw haze indicator.
    if (entity.effect.haze) {
      this.gfx_.setStyle(style.haze);
      this.gfx_.circle(entity.render.pos.x, entity.render.pos.y,
                       entity.radius * 1.5);
    }

    // Draw disabled indicator.
    if (entity.effect.disabled) {
      shipStyle = style.disabled;
    }

    // Draw health indicator.
    if (entity.health <= 10 && damage) {
      entity.render.healthIndicator = 30;
    }
    if (entity.render.healthIndicator) {
      shipStyle = style.dmged;
      entity.render.healthIndicator--;
    }

    if (entity.effect.invisible) {
      customStyle = {};
      customStyle.globalAlpha = .4;
    }
  } else {
    // Death animation.
    if (entity.dead) {
      customStyle = {
        globalAlpha: entity.render.deathAnimation / DEATH_ANIMATION_DURATION
      };
      entity.render.deathAnimation -= dt;
      if (entity.render.deathAnimation < 0) entity.render.deathAnimation = 0;
    }
  }

  // Draw ship.
  this.gfx_.setStyle(shipStyle, customStyle);
  this.gfx_.image(entity.hull.sprite, entity.render.pos.x, entity.render.pos.y,
                  entity.rotation, entity.render.radius);

  // DEBUG: See the hit box of the ship.
  //this.gfx_.setStyle(style.reflect);
  //this.gfx_.circle(entity.render.pos.x, entity.render.pos.y,
  //                 entity.render.radius);

  // DEBUG: See where the ship is aiming.
  //var dx = entity.render.pos.x - entity.x;
  //var dy = entity.render.pos.y - entity.y;
  //if (entity.aimPos) {
  //  this.gfx_.circle(entity.aimPos.x + dx, entity.aimPos.y + dy, 3);
  //}
  //if (entity.utility.teleportPos) {
  //  this.gfx_.circle(entity.utility.teleportPos.x + dx,
  //                   entity.utility.teleportPos.y + dy, 3);
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
Renderer.prototype.drawLaser_ = function(entity, style) {
  if (entity.dead) {
    entity.remove = true;
    return;
  }

  this.gfx_.setStyle(style[entity.style || 'strong']);
  var dx = Math.cos(entity.rotation) * SPEED_FUDGING;
  var dy = Math.sin(entity.rotation) * SPEED_FUDGING;
  this.gfx_.line(entity.render.pos.x + dx, entity.render.pos.y + dy,
                 entity.dx - dx * 2, entity.dy - dy * 2);
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
Renderer.prototype.drawBomb_ = function(entity, style, dt) {
  if (entity.remove) return;
  if (entity.dead) {
    // Draw explosion.
    if (!_.isDef(entity.render.explodeTime)) {
      entity.render.explodeTime = 0;
    }

    entity.render.explodeTime += dt;
    var ratio = Math.min(entity.render.explodeTime / EXPLOSION_DURATION, 1);
    this.gfx_.setStyle(style[(entity.style || 'normal') + 'Explode']);
    this.gfx_.circle(entity.render.pos.x, entity.render.pos.y,
                     Math.pow(ratio, 2) * entity.radius);

    if (ratio == 1) entity.remove = true;
  } else {
    this.gfx_.setStyle(style[entity.style || 'normal']);
    this.gfx_.circle(entity.render.pos.x, entity.render.pos.y,
                     entity.radius * NORMAL_SIZE);
  }
};

Renderer.prototype.addBallStyle_ = function(style) {
  style.normal = this.gfx_.addStyle({
    fill: Gfx.Color.GRAY
  });
};
Renderer.prototype.drawBall_ = function(entity, style, dt) {
  if (entity.dead) {
    entity.remove = true;
    return;
  }
  this.gfx_.setStyle(style.normal);
  this.gfx_.circle(entity.render.pos.x, entity.render.pos.y,
                   entity.radius);
};

Renderer.prototype.addAuraStyle_ = function(style) {
  style.normal = this.gfx_.addStyle({
    stroke: Gfx.Color.OPAC_WHITE,
    lineWidth: 16
  });
};
Renderer.prototype.drawAura_ = function(entity, style, dt) {
  if (entity.dead) {
    entity.remove = true;
    return;
  }
  this.gfx_.setStyle(style.normal);
  this.gfx_.circle(entity.render.pos.x, entity.render.pos.y,
                   entity.radius);

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
Renderer.prototype.drawBlade_ = function(entity, style, dt) {
  if (entity.dead) {
    entity.remove = true;
    return;
  }
  var triangle = _.geometry.circumscribeTriangle(
      entity.render.pos.x, entity.render.pos.y,
      entity.radius - 1, entity.rotation);
  this.gfx_.setStyle(style[entity.style || 'normal']);
  this.gfx_.triangle(triangle.x1, triangle.y1,
                     triangle.x2, triangle.y2,
                     triangle.x3, triangle.y3);

};

Renderer.prototype.drawText_ = function(text, size, x, y, opt_options) {
  var options = opt_options || {};
  var color = options.color || '#FFFFFF';
  this.textCtx_.fillStyle = color;
  this.textCtx_.shadowBlur = 0;
  this.setFont_(size, Gfx.Font.TEXT, options.bold);
  this.fillText_(text, x, y);
};

Renderer.prototype.drawTitle_ = function(text, size, x, y) {
  this.textCtx_.fillStyle = '#FFFFFF';
  this.textCtx_.shadowBlur = 0;
  this.setFont_(size, Gfx.Font.TITLE);
  this.fillText_(text, x, y);
};

Renderer.prototype.underlineLabel_ = function(entity, opt_options) {
  var options = opt_options || {};
  options.color = '#FFFFFF';
  if (entity.style == 'equipped' || entity.style == 'active') {
    options.color = Gfx.Color.ACTIVE;
  }
  options.lineDirection = entity.lineDirection;
  this.underlineText_(entity.text, entity.size,
                      entity.render.pos.x, entity.render.pos.y, options);
};

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
    var width = this.font_.width(text, size);
    this.line_(x + width, y, 0, y, lineWidth);
  }
};

// NOT USED.
Renderer.prototype.circleText_ = function(entity) {
  // TODO: This is currently dependant on text length.
  this.ctx_.shadowBlur = 2;
  this.ctx_.lineWidth = 2;
  this.ctx_.strokeStyle = this.ctx_.shadowColor = '#FFFFFF';
  this.ctx_.fillStyle = '#000000';
  var width = this.font_.width(entity.text, entity.size);
  var endPadding = entity.size * 1.4;
  var topPadding = entity.size * 1;
  var y = entity.render.pos.y + entity.size / 10;
  var x = entity.render.pos.x - width / 2 - endPadding;
  var x2 = x + width + endPadding * 2;

  this.ctx_.beginPath();
  this.ctx_.arc(x, y, topPadding, Math.PI / 2, -Math.PI / 2);
  this.ctx_.lineTo(x2, y - topPadding);
  this.ctx_.arc(x2, y, topPadding, -Math.PI / 2, Math.PI / 2);
  this.ctx_.lineTo(x, y + topPadding);

  this.ctx_.fill();
  this.ctx_.stroke();
};

Renderer.prototype.line_ = function(x1, y1, x2, y2, lineWidth) {
  x1 = Math.round(x1 * this.screen_.upscale);
  y1 = Math.round(y1 * this.screen_.upscale);
  x2 = Math.round(x2 * this.screen_.upscale);
  y2 = Math.round(y2 * this.screen_.upscale);
  if (lineWidth) {
    lineWidth = Math.round(lineWidth * this.screen_.upscale);
    this.textCtx_.lineWidth = lineWidth;
  }
  this.textCtx_.beginPath();
  this.textCtx_.moveTo(x1, y1);
  this.textCtx_.lineTo(x2, y2);
  this.textCtx_.stroke();
};

Renderer.prototype.circle_ = function(x, y, radius, lineWidth, opt_ratio) {
  var ratio = opt_ratio === undefined ? 1 : opt_ratio;
  x = Math.round(x * this.screen_.upscale);
  y = Math.round(y * this.screen_.upscale);
  radius = Math.round(radius * this.screen_.upscale);
  if (lineWidth) {
    lineWidth = Math.round(lineWidth * this.screen_.upscale);
    this.textCtx_.lineWidth = lineWidth;
  } else lineWidth = 0;
  this.textCtx_.beginPath();
  this.textCtx_.arc(x, y, radius - lineWidth / 2,
                    0, 2 * Math.PI * ratio);
};

Renderer.prototype.fillRect_ = function(x, y, width, height) {
  x = Math.round(x * this.screen_.upscale);
  y = Math.round(y * this.screen_.upscale);
  width = Math.round(width * this.screen_.upscale);
  height = Math.round(height * this.screen_.upscale);
  this.textCtx_.fillRect(0, 0, width, height);
};

Renderer.prototype.setFont_ = function(size, font, bold) {
  size = Math.round(size * this.screen_.upscale);
  this.textCtx_.font =
      (bold ? 'bold ' : '') + size + 'px ' + font;
};

Renderer.prototype.strokeText_ = function(text, x, y) {
  x = Math.round(x * this.screen_.upscale);
  y = Math.round(y * this.screen_.upscale);
  this.textCtx_.strokeText(text, x, y);
};

Renderer.prototype.fillText_ = function(text, x, y) {
  x = Math.round(x * this.screen_.upscale);
  y = Math.round(y * this.screen_.upscale);
  this.textCtx_.fillText(text, x, y);
};
