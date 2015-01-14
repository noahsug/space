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
};

Renderer.prototype.update = function(dt) {
  this.handleCamera_(dt / this.gm_.speed);
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

var TRANSITION_SPEED = 1;
Renderer.prototype.drawTransition_ = function(dt) {
  var transition = this.gm_.transition;
  if (transition) {
    this.transitionAnimation_ += 700 * (dt / TRANSITION_SPEED);
    var pos = this.getPos_(transition.pos);
    this.ctx_.fillStyle = "black";
    this.ctx_.beginPath();
    this.ctx_.arc(pos.x, pos.y, this.transitionAnimation_, 0, Math.PI * 2);
    this.ctx_.fill();

  } else if (!this.transitionAnimation_ ||
      this.transitionAnimation_ <= dt / TRANSITION_SPEED) {
    this.transitionAnimation_ = 0;

  } else {
    if (this.transitionAnimation_ > 1) this.transitionAnimation_ = 1;
    var fade = this.gm_.scenes.intro == 'active' ? 4 : 1;
    var ease = (1.05 - this.transitionAnimation_) * 8;
    this.transitionAnimation_ -= ease * dt / fade;
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

  this.ctx_.fillStyle = 'black';
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

Renderer.prototype.drawTitleSplash_ = function(entity) {
  var title = 'COSMAL';
  var fontSize = Math.min(this.screen_.width / 4, this.screen_.height / 2);
  this.ctx_.strokeStyle = this.ctx_.shadowColor = '#FFFFFF';
  this.ctx_.fillStyle = '#FFFFFF';
  this.ctx_.shadowBlur = fontSize / 8;
  this.ctx_.lineWidth = 2;
  this.ctx_.font = fontSize + 'px ' + Gfx.Font.TITLE;
  this.ctx_.textAlign = 'center';
  this.ctx_.textBaseline = 'alphabetic';

  var x = this.screen_.width / 2;
  var y = this.screen_.height / 2;
  this.ctx_.strokeText(title, x, y);
  this.ctx_.fillText(title, x, y);
};

Renderer.prototype.drawBtn_ = function(entity) {
  this.underlineText_(entity, entity.render.pos);

  this.ctx_.fillStyle = this.ctx_.shadowColor = 'white';
  this.ctx_.shadowBlur = entity.size / 8;
  this.drawText_(entity, entity.render.pos);
};

Renderer.prototype.drawLabel_ = function(entity) {
  this.ctx_.fillStyle = '#FFFFFF';
  this.ctx_.font = entity.size + 'px Arial';
  this.ctx_.textAlign = entity.align;
  this.ctx_.textBaseline = entity.baseline;
  this.ctx_.fillText(entity.text, entity.render.pos.x, entity.render.pos. y);
};

Renderer.prototype.drawResultsSplash_ = function(entity) {
  var title = this.gm_.results.won ? 'Victory' : 'Defeat';
  var fontSize = Math.min(this.screen_.width / 5, this.screen_.height / 2);
  this.ctx_.strokeStyle = this.ctx_.shadowColor = '#FFFFFF';
  this.ctx_.lineWidth = 2;
  this.ctx_.fillStyle = '#FFFFFF';
  this.ctx_.shadowBlur = fontSize / 8;
  this.ctx_.font = 'bold ' + fontSize + 'px Arial';
  this.ctx_.textAlign = 'center';
  this.ctx_.textBaseline = 'alphabetic';

  var x = this.screen_.x + entity.render.pos.x;
  var y = this.screen_.y + entity.render.pos.y - this.screen_.height / 2 + 100;
  this.ctx_.strokeText(title, x, y);
  this.ctx_.fillText(title, x, y);

  if (this.gm_.results.won) {
    var itemPos = {
      x: this.screen_.x + entity.render.pos.x,
      y: this.screen_.y + entity.render.pos.y
    };
    this.drawItem_(this.gm_.results.earned, itemPos);
    title = 'aquired:';
    y = itemPos.y - 20;
    this.ctx_.fillText(title, x, y);
  }
};

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

Renderer.prototype.drawText_ = function(entity) {
  this.ctx_.font = entity.size + 'px ' + Gfx.Font.TEXT;
  this.ctx_.textAlign = entity.align;
  this.ctx_.textBaseline = entity.baseline;
  this.ctx_.fillText(entity.text, entity.render.pos.x, entity.render.pos.y);
};

Renderer.prototype.underlineText_ = function(entity) {
  var y = entity.render.pos.y + entity.size + 5;
  this.ctx_.lineWidth = 1;
  this.ctx_.shadowBlur = 2;
  this.ctx_.strokeStyle = this.ctx_.shadowColor = '#FFFFFF';
  this.ctx_.beginPath();
  this.ctx_.moveTo(entity.render.pos.x, y);
  this.ctx_.lineTo(entity.render.pos.x + this.screen_.width, y);
  this.ctx_.stroke();
};

Renderer.prototype.circleText_ = function(entity) {
  // TODO: This is currently dependant on text length.
  this.ctx_.shadowBlur = 2;
  this.ctx_.lineWidth = 2;
  this.ctx_.strokeStyle = this.ctx_.shadowColor = 'white';
  this.ctx_.fillStyle = 'black';
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
