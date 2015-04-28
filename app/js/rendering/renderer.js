var Renderer = di.service('Renderer', [
  'GameModel as gm', 'Screen', 'ctx', 'Gfx', 'Background', 'Font',
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
  this.ctx_.save();
  for (var i = 0; i < this.gm_.entities.length; i++) {
    this.drawEntity_(this.gm_.entities.arr[i], dt);
  }
  this.ctx_.restore();
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

  this.ctx_.textAlign = 'left';
  this.ctx_.textBaseline = 'top';
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
  this.ctx_.fillStyle = '#000000';
  this.ctx_.beginPath();
  this.ctx_.arc(x, y, this.transitionAnimation_, 0, Math.PI * 2);
  this.ctx_.fill();
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
    this.ctx_.fillStyle = "rgba(0, 0, 0, " + this.transitionAnimation_ + ")";
    this.ctx_.fillRect(0, 0, this.screen_.width, this.screen_.height);
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
};

Renderer.prototype.drawIntroSplash_ = function() {
  var fontSize = 70;
  this.ctx_.textAlign = 'center';
  this.ctx_.textBaseline = 'alphabetic';
  this.drawTitle_('COSMAL', fontSize,
                  this.screen_.width / 2, this.screen_.height / 2);
};

Renderer.prototype.drawResultSplash_ = function(entity) {
  this.ctx_.textAlign = 'left';
  this.ctx_.textBaseline = 'top';
  var result = this.gm_.stage.state == 'won' ? 'victory' : 'defeat';
  this.drawHeading_(result, 70, entity.render.pos.x, entity.render.pos.y);
};

Renderer.prototype.drawPlayerSplash_ = function(entity) {
  this.spriteService_.draw(
      this.inventory_.getHull().name,
      this.screen_.width / 2, entity.render.pos.y);
};

Renderer.prototype.drawEnemySplash_ = function(entity) {
  this.spriteService_.draw(
      this.gm_.stage.hull.name,
      this.screen_.width / 2, entity.render.pos.y,
      {rotation: Math.PI});
};

Renderer.prototype.drawWonSplash_ = function() {
  var fontSize = 50;
  this.ctx_.textAlign = 'center';
  this.ctx_.textBaseline = 'alphabetic';
  var text = _.last(this.gm_.worlds) == this.gm_.world ?
      'You Win' : 'World Clear';
  this.drawTitle_(text, fontSize,
                  this.screen_.width / 2, this.screen_.height / 2);
};

Renderer.prototype.drawLostSplash_ = function() {
  var fontSize = 50;
  this.ctx_.textAlign = 'center';
  this.ctx_.textBaseline = 'alphabetic';
  this.drawTitle_('World Failed', fontSize,
                  this.screen_.width / 2, this.screen_.height / 2);
};

var DESC_ONLY = _.newSet([
  'charge', 'charge II', 'tracker', 'tracker II', 'pull', 'melee',
]);
Renderer.prototype.drawItemDesc_ = function(entity) {
  var size = 12;
  if (!entity.item) return;
  this.ctx_.textAlign = 'left';
  this.ctx_.textBaseline = 'middle';

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
    this.drawText_(textLines[0], size,
                   entity.render.pos.x, entity.render.pos.y - size / 2 - 2);
    this.drawText_(textLines[1], size,
                   entity.render.pos.x, entity.render.pos.y + size / 2 + 2);
  } else {
    this.drawText_(textLines[0], size,
                   entity.render.pos.x, entity.render.pos.y);
  }
};

Renderer.prototype.topLeftHeading_ = function(text) {
  this.ctx_.textAlign = 'left';
  this.ctx_.textBaseline = 'top';
  this.drawHeading_(text, 40, 20, 20 - 16);
};

Renderer.prototype.topLeftSubHeading_ = function(text, opt_color) {
  this.ctx_.textAlign = 'left';
  this.ctx_.textBaseline = 'top';
  this.drawHeading_(text, 24, 20, 70 - 16, opt_color);
};

Renderer.prototype.drawBreak_ = function(entity) {
  this.ctx_.strokeStyle = '#CCC';
  this.ctx_.lineWidth = 1;
  this.ctx_.shadowBlur = 0;
  var x = this.screen_.width / 8;
  var y = entity.render.pos.y;
  this.ctx_.beginPath();
  this.ctx_.moveTo(this.screen_.width - x, y);
  this.ctx_.lineTo(x, y);
  this.ctx_.stroke();
};

// TODO: Animate stage state changes.
Renderer.prototype.drawRoundBtn_ = function(entity) {
  if (entity.style == 'hidden') return;

  // Draw circle.
  var color = '#FFFFFF';
  var fillColor = '#000000';
  var lineWidth = 2;
  if (entity.stage) {
    if (entity.stage.state == 'won' || entity.stage.state == 'lost') {
      return;
    }
    fillColor = '';
    lineWidth = .25;
    if (entity.stage.end) color = Gfx.Color.ACTIVE;
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

  this.ctx_.shadowBlur = 0;
  this.ctx_.fillStyle = fillColor;
  this.ctx_.strokeStyle = color;
  this.ctx_.lineWidth = lineWidth;
  this.ctx_.beginPath();
  this.ctx_.arc(entity.render.pos.x, entity.render.pos.y,
                entity.radius - lineWidth / 2, 0, 2 * Math.PI);
  if (fillColor) this.ctx_.fill();
  this.ctx_.stroke();

  // Draw context.
  var text = entity.text;
  var textSize = Size.ITEM_TEXT;
  if (entity.stage) {
    var hull = entity.stage.hull.name;
    var rotation = entity.stage.enemy ? Math.PI : 0;
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
    text = entity.item.name || 'none';
    textSize = Size.ITEM_TEXT;
  } else if (entity.category) {
    text = Strings.ItemType[entity.category];
  }

  this.ctx_.textAlign = 'center';
  this.ctx_.textBaseline = 'middle';
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
  this.ctx_.textAlign = entity.align;
  this.ctx_.textBaseline = entity.baseline;
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
    lineWidth: 2,
    fill: Gfx.Color.MORE_OPAC_BLUE,
    stroke: Gfx.Color.OPAC_BLUE
  });
  style.reflect = this.gfx_.addStyle({
    lineWidth: 2,
    stroke: Gfx.Color.OPAC_YELLOW
  });
  style.haze = this.gfx_.addStyle({
    fill: Gfx.Color.OPAC_GRAY
  });
};
Renderer.prototype.drawShip_ = function(entity, style, dt) {
  var damage = entity.prevHealth - entity.health;
  if (damage != entity.render.damageTaken) {
    entity.render.damageTaken = damage;
  } else {
    damage = 0;
  }

  // Shake afer taking damage.
  if (damage) {
    entity.render.shaking = Math.floor(4 + damage / 4);
  }
  if (entity.render.shaking) {
    var shake = 2 + entity.render.damageTaken / 2;
    entity.render.pos.x += (.3 + .7 * Math.random()) * shake;
    entity.render.pos.y += (.3 + .7 * Math.random()) * shake;
    entity.render.shaking--;
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
      customStyle.globalAlpha = .5;
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
  this.gfx_.image(entity.hull.style, entity.render.pos.x, entity.render.pos.y,
                  entity.rotation + Math.PI / 2, entity.render.radius);

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
};
Renderer.prototype.drawLaser_ = function(entity, style) {
  if (entity.dead) {
    entity.remove = true;
    return;
  }

  if (entity.style == 'weak') {
    this.gfx_.setStyle(style.weak);
  } else if (entity.style == 'effect') {
    this.gfx_.setStyle(style.effect);
  } else {
    this.gfx_.setStyle(style.strong);
  }
  var dx = Math.cos(entity.rotation) * SPEED_FUDGING;
  var dy = Math.sin(entity.rotation) * SPEED_FUDGING;
  this.gfx_.line(entity.render.pos.x + dx, entity.render.pos.y + dy,
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
Renderer.prototype.drawBomb_ = function(entity, style, dt) {
  if (entity.remove) return;
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
    this.gfx_.circle(entity.render.pos.x, entity.render.pos.y,
                     Math.pow(ratio, 2) * entity.radius);

    if (ratio == 1) entity.remove = true;
  } else {
    if (entity.style == 'effect') {
      this.gfx_.setStyle(style.effect);
    } else {
      this.gfx_.setStyle(style.normal);
    }
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
};
Renderer.prototype.drawBlade_ = function(entity, style, dt) {
  if (entity.dead) {
    entity.remove = true;
    return;
  }
  var triangle = _.geometry.circumscribeTriangle(
      entity.render.pos.x, entity.render.pos.y,
      entity.radius - 1, entity.rotation);
  this.gfx_.setStyle(style.normal);
  this.gfx_.triangle(triangle.x1, triangle.y1,
                     triangle.x2, triangle.y2,
                     triangle.x3, triangle.y3);

};

Renderer.prototype.drawText_ = function(text, size, x, y, opt_options) {
  var options = opt_options || {};
  var color = options.color || '#FFFFFF';
  this.ctx_.fillStyle = color;
  this.ctx_.shadowBlur = 0;
  this.ctx_.font = (options.bold ? 'bold ' : '') + size + 'px ' + Gfx.Font.TEXT;
  this.ctx_.fillText(text, x, y);
};

Renderer.prototype.drawTitle_ = function(text, size, x, y) {
  this.ctx_.strokeStyle = this.ctx_.shadowColor = '#FFFFFF';
  this.ctx_.fillStyle = '#FFFFFF';
  this.ctx_.shadowBlur = size / 8;
  this.ctx_.lineWidth = 2;
  this.ctx_.font = size + 'px ' + Gfx.Font.TITLE;
  this.ctx_.strokeText(text, x, y);
  this.ctx_.fillText(text, x, y);
};

Renderer.prototype.drawHeading_ = function(text, size, x, y, opt_color) {
  var color = opt_color || '#FFFFFF';
  this.ctx_.fillStyle = this.ctx_.strokeStyle = color;
  this.ctx_.shadowBlur = 0;
  this.ctx_.lineWidth = 1;
  this.ctx_.font = size + 'px ' + Gfx.Font.TITLE;
  this.ctx_.strokeText(text, x, y);
  this.ctx_.fillText(text, x, y);
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
  var options = opt_options || {};
  options.color = options.color || '#FFFFFF';
  options.lineDirection = options.lineDirection || 'right';
  y += size + 5;
  this.ctx_.lineWidth = 1;
  this.ctx_.shadowBlur = 2;
  this.ctx_.strokeStyle = this.ctx_.shadowColor = options.color;
  this.ctx_.beginPath();

  if (options.lineDirection == 'right') {
    this.ctx_.moveTo(x, y);
    this.ctx_.lineTo(x + this.screen_.width, y);
  } else {
    var width = this.font_.width(text, size);
    this.ctx_.moveTo(x + width, y);
    this.ctx_.lineTo(0, y);
  }

  this.ctx_.stroke();
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
