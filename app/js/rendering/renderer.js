var Renderer = di.service('Renderer', [
  'GameModel as gm', 'Screen', 'ctx', 'Gfx', 'Background', 'Font']);

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
  this.topLeftHeading_(Strings.Level[this.gm_.level]);
  var color = (this.gm_.daysLeft <= 1) && Gfx.Color.WARN;
  var msg = this.gm_.daysLeft + ' ' + _.plural('day', this.gm_.daysLeft) +
      ' left';
  this.topLeftSubHeading_(msg, color);
};

Renderer.prototype.drawResultSplash_ = function() {
  this.ctx_.textAlign = 'center';
  this.ctx_.textBaseline = 'top';
  var result = this.gm_.results.won ? 'victory' : 'defeat';
  this.drawHeading_(result, 70, this.screen_.width / 2, 30 - 12);

  if (!_.isEmpty(this.gm_.results.earned)) {
    var y = this.screen_.height / 2 - 20;
    var x = this.screen_.width / 2;
    this.ctx_.textAlign = 'right';
    var msg = this.gm_.results.earned.item ? 'aquired:' : 'gained:';
    this.drawText_(msg, 16, x, y);

    y += 30;
    this.ctx_.textAlign = 'left';
    if (this.gm_.results.earned.item) {
      var item = this.gm_.results.earned.item;
      this.drawText_(item.name, 16, x, y, true);
      msg = '(' + Strings.ItemType[item.category] + ')';
      this.drawText_(msg, 16, x, y + 20);
    }
  }
};

Renderer.prototype.drawEquipOptionsSplash_ = function() {
  this.topLeftHeading_('customize');
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

Renderer.prototype.drawBtn_ = function(entity) {
  this.underlineLabel_(entity);
  this.drawLabel_(entity);
};

Renderer.prototype.drawLabel_ = function(entity) {
  var color = null;
  if (entity.style == 'equipped') {
    color = Gfx.Color.SUCCESS;
  }
  this.ctx_.textAlign = entity.align;
  this.ctx_.textBaseline = entity.baseline;
  this.drawText_(entity.text, entity.size,
                 entity.render.pos.x, entity.render.pos.y,
                 false, color);
};

Renderer.prototype.drawHitbox_ = function(entity) {
  // DEBUG.
  //this.ctx_.fillStyle = 'red';
  //this.ctx_.fillRect(entity.render.pos.x, entity.render.pos.y,
  //                   entity.width, entity.height);
};

// NOT USED.
Renderer.prototype.drawBtnSm_ = function(entity) {
  this.ctx_.fillStyle = '#000000';
  this.ctx_.lineWidth = 2;
  var color = '#FFFFFF';
  if (entity.equipped) {
    color = '#44FF77';
  } else if (entity.locked) {
    color = Gfx.Color.LOCKED;
  }
  this.ctx_.strokeStyle = color;

  this.ctx_.beginPath();
  this.ctx_.arc(entity.render.pos.x, entity.render.pos.y,
                entity.radius - 1, 0, 2 * Math.PI);
  this.ctx_.fill();
  this.ctx_.stroke();
  if (entity.name) {
    this.drawItem_(entity, entity.render.pos);
  };

  //if (entity.locked) {
  //  this.ctx_.fillStyle = 'rgba(200, 200, 200, .5)';
  //  this.ctx_.font = (entity.radius * 2) + 'px Arial';
  //  this.ctx_.fillText('✕', entity.render.pos.x, entity.render.pos.y);
  //}
};

// NOT USED.
Renderer.prototype.drawItem_ = function(item, pos) {
  var size = item.fontSize || 12;
  if (item.locked) {
    this.ctx_.fillStyle = Gfx.Color.LOCKED;
  } else {
    this.ctx_.fillStyle = '#FFFFFF';
  }
  this.ctx_.font = size + 'px Arial';
  this.ctx_.textAlign = 'center';
  this.ctx_.textBaseline = 'middle';
  var x = pos.x; var y = pos.y;
  if (item.name == '↩') y += 3;
  if (item.name == '◃') { x -= 1; y += 1; }
  this.ctx_.fillText(item.name, x, y);
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
};
Renderer.prototype.drawShip_ = function(entity, style, dt) {
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
  }

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

  // Draw health indicator
  if (!entity.dead) {
    if (entity.health <= damage) {
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
                   entity.render.radius - 2);

  // DEBUG.
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

var SPEED_FUDGING = 8;
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

Renderer.prototype.drawText_ = function(text, size, x, y, opt_bold, opt_color) {
  var color = opt_color || '#FFFFFF';
  this.ctx_.fillStyle = color;
  this.ctx_.shadowBlur = 0;
  this.ctx_.font = (opt_bold ? 'bold ' : '') + size + 'px ' + Gfx.Font.TEXT;
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

Renderer.prototype.underlineLabel_ = function(entity) {
  var color = null;
  if (entity.style == 'equipped') {
    color = Gfx.Color.SUCCESS;
  }
  this.underlineText_(entity.size, entity.render.pos.x, entity.render.pos.y,
                      color);
};

Renderer.prototype.underlineText_ = function(size, x, y, opt_color) {
  var color = opt_color || '#FFFFFF';
  y += size + 5;
  this.ctx_.lineWidth = 1;
  this.ctx_.shadowBlur = 2;
  this.ctx_.strokeStyle = this.ctx_.shadowColor = color;
  this.ctx_.beginPath();
  this.ctx_.moveTo(x, y);
  this.ctx_.lineTo(x + this.screen_.width, y);
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
