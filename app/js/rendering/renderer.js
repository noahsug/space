var Renderer = di.service('Renderer', [
  'GameModel as gm', 'Screen', 'ctx', 'Gfx', 'Background', 'Font',
  'Inventory']);

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
  this.drawTransition_(dt);
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
  this.ctx_.save();
  if (!entity.render) {
    entity.render = {};
    this.initFns_[entity.type] && this.initFns_[entity.type](entity);
  }
  entity.render.pos = this.getPos_(entity);
  this.drawFns_[entity.type](entity, this.style_[entity.type], dt);
  this.ctx_.restore();
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
  this.ctx_.shadowBlur = 8;
  this.ctx_.lineWidth = 2;
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

Renderer.prototype.drawMainSplash_ = function() {
};

Renderer.prototype.drawResultSplash_ = function() {
  this.ctx_.textAlign = 'center';
  this.ctx_.textBaseline = 'top';
  var result = this.gm_.level.state == 'won' ? 'victory' : 'defeat';
  this.drawHeading_(result, 70, this.screen_.width / 2, 30 - 12);

  if (!_.isEmpty(this.gm_.level.earned)) {
    var y = this.screen_.height / 2 - 20;
    var x = this.screen_.width / 2;
    this.ctx_.textAlign = 'right';
    var msg = this.gm_.level.earned.item ? 'aquired:' : 'gained:';
    this.drawText_(msg, 16, x, y);

    y += 30;
    this.ctx_.textAlign = 'left';
    if (this.gm_.level.earned.item) {
      var item = this.gm_.level.earned.item;
      this.drawText_(item.name, 16, x, y, {bold: true});
      msg = '(' + Strings.ItemType[item.category] + ')';
      this.drawText_(msg, 16, x, y + 20);
    }
  }
};

Renderer.prototype.drawEquipOptionsSplash_ = function() {
  var outerPadding = 30;

  this.ctx_.fillStyle = '#000000';
  this.ctx_.strokeStyle = '#FFFFFF';
  this.ctx_.lineWidth = 1;
  var x = outerPadding;
  var y = 40;
  var width = this.screen_.width - outerPadding * 2;
  var height = 120;
  this.ctx_.fillRect(x, y, width, height);
  this.ctx_.strokeRect(x, y, width, height);

  this.ctx_.textAlign = 'left';
  this.ctx_.textBaseline = 'top';
  this.drawText_('target:', 16, outerPadding, 18);

  x = outerPadding + 15;
  y = 50;
  _.each(this.gm_.level.enemy, function(item, i) {
    this.drawText_(item.name, 18, x, y + 25 * i);
  }, this);
};

Renderer.prototype.drawEquipSplash_ = function() {
  this.topLeftHeading_(Strings.ItemType[this.gm_.equipping]);
};

Renderer.prototype.drawWonSplash_ = function() {
  var fontSize = 50;
  this.ctx_.textAlign = 'center';
  this.ctx_.textBaseline = 'alphabetic';
  this.drawTitle_('YOU WIN', fontSize,
                  this.screen_.width / 2, this.screen_.height / 2);
};

Renderer.prototype.drawLostSplash_ = function() {
  var fontSize = 50;
  this.ctx_.textAlign = 'center';
  this.ctx_.textBaseline = 'alphabetic';
  this.drawTitle_('YOU LOSE', fontSize,
                  this.screen_.width / 2, this.screen_.height / 2);
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

// TODO: Animate level state changes.
Renderer.prototype.drawRoundBtn_ = function(entity) {
  // Draw circle.
  var color = '#FFFFFF';
  if (entity.level) {
    switch (entity.level.state) {
      case 'won':
      case 'lost': return;
      case 'locked': color = Gfx.Color.LOCKED; break;
      case 'unlocked': color = '#FFFFFF'; break;
      default: _.fail('invalid state: ', entity.level.state);
    }
  } else if (entity.item) {
    if (!this.inventory_.has(entity.item.category)) color = Gfx.Color.LOCKED;
  }
  this.ctx_.strokeStyle = color;
  this.ctx_.fillStyle = '#000000';
  this.ctx_.lineWidth = 2;
  this.ctx_.beginPath();
  this.ctx_.arc(entity.render.pos.x, entity.render.pos.y,
                entity.radius - 1, 0, 2 * Math.PI);
  this.ctx_.fill();
  this.ctx_.stroke();

  // Draw text.
  var text = '';
  var textSize;
  if (entity.level) {
    if (entity.level.state == 'won') return;
    textSize = 20;
    text = entity.level.type;
  } else if (entity.item) {
    text = entity.item.name || 'none';
    textSize = 16;
  }
  this.ctx_.textAlign = 'center';
  this.ctx_.textBaseline = 'middle';
  this.drawText_(text, textSize, entity.render.pos.x, entity.render.pos.y,
                 {color: color});
};

Renderer.prototype.drawBtn_ = function(entity) {
  this.underlineLabel_(entity, {direction: entity.direction});
  this.drawLabel_(entity);
};

Renderer.prototype.drawLabel_ = function(entity) {
  var color = null;
  if (entity.style == 'equipped' || entity.style == 'active') {
    color = Gfx.Color.ACTIVE;
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
var SHIP_SHRINKAGE = 2;
Renderer.prototype.initShip_ = function(entity) {
  entity.render.damageTaken = 0;
  entity.render.shaking = 0;
  entity.render.healthIndicator = 0;
  entity.render.deathAnimation = DEATH_ANIMATION_DURATION;
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
    stroke: Gfx.Color.BLUE
  }, baseStyle));
  style.goodDmged = this.gfx_.addStyle({
    lineWidth: 5,
    stroke: Gfx.Color.OPAC_RED,
    shadow: 'none'
  });
  style.badDmged = this.gfx_.addStyle({
    lineWidth: 5,
    stroke: Gfx.Color.MORE_OPAC_RED,
    shadow: 'none'
  });
  style.disabled = this.gfx_.addStyle({
    lineWidth: 5,
    stroke: Gfx.Color.OPAC_BLUE,
    shadow: 'none'
  });
  style.tagged = this.gfx_.addStyle({
    fill: Gfx.Color.OPAC_RED
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
  style.invisible = this.gfx_.addStyle({
    stroke: Gfx.Color.LESS_OPAC_GRAY,
    lineWidth: 3
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

    // Draw disabled indicator.
    if (entity.effect.disabled) {
      this.gfx_.setStyle(style.disabled);
      this.gfx_.circle(entity.render.pos.x, entity.render.pos.y,
                       entity.render.radius - 5);
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

    // Draw reflect indicator.
    if (entity.effect.haze) {
      this.gfx_.setStyle(style.haze);
      this.gfx_.circle(entity.render.pos.x, entity.render.pos.y,
                       entity.radius * 1.5);
    }

    // Draw invisible indicator.
    if (entity.effect.invisible) {
      this.gfx_.setStyle(style.invisible);
      this.gfx_.circle(entity.render.pos.x, entity.render.pos.y,
                       entity.render.radius - SHIP_SHRINKAGE);
    }

    // Draw health indicator.
    if (entity.health <= 10 && damage) {
      entity.render.healthIndicator = 30;
    }
    if (entity.render.healthIndicator) {
      var healthStyle = style[entity.style + 'Dmged'];
      this.gfx_.setStyle(healthStyle);
      this.gfx_.circle(entity.render.pos.x, entity.render.pos.y,
                       entity.render.radius - 5);
      entity.render.healthIndicator--;
    }
  }

  // Death animation.
  var customStyle;
  if (entity.dead) {
    customStyle = {
      globalAlpha: entity.render.deathAnimation / DEATH_ANIMATION_DURATION
    };
    entity.render.deathAnimation -= dt;
    if (entity.render.deathAnimation < 0) entity.render.deathAnimation = 0;
  }

  // Draw ship.
  this.gfx_.setStyle(style[entity.style], customStyle);
  this.gfx_.circle(entity.render.pos.x, entity.render.pos.y,
                   entity.render.radius - SHIP_SHRINKAGE);

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
  style.weak = this.gfx_.addStyle({
    stroke: Gfx.Color.YELLOW,
    lineWidth: 2
  });
  style.strong = this.gfx_.addStyle({
    stroke: Gfx.Color.RED,
    lineWidth: 2
  });
  style.effect = this.gfx_.addStyle({
    stroke: Gfx.Color.PINK,
    lineWidth: 3
  });
};
Renderer.prototype.drawLaser_ = function(entity, style) {
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
    lineWidth: 1
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
