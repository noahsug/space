var SpriteService = di.service('SpriteService', ['ctx', 'textCtx', 'Screen']);

var Sprite = {};
Sprite.DRAKIR = new Image();
Sprite.DRAKIR.src = 'assets/drakir_36.png';

Sprite.SPACESTATION = new Image();
Sprite.SPACESTATION.src = 'assets/spacestation_40.png';

Sprite.RD2 = new Image();
Sprite.RD2.src = 'assets/RD2_36.png';

Sprite.TRI = new Image();
Sprite.TRI.src = 'assets/tri_120.png';

Sprite.ALIEN1 = new Image();
Sprite.ALIEN1.src = 'assets/alien1_40.png';

Sprite.ALIEN2 = new Image();
Sprite.ALIEN2.src = 'assets/alien2_60.png';

Sprite.ALIEN3 = new Image();
Sprite.ALIEN3.src = 'assets/alien3_47.png';

Sprite.ALIEN4 = new Image();
Sprite.ALIEN4.src = 'assets/alien4_46.png';

Sprite.ALIENSHIPTEX = new Image();
Sprite.ALIENSHIPTEX.src = 'assets/alienshiptex_136.png';

Sprite.OSPACESHIP = new Image();
Sprite.OSPACESHIP.src = 'assets/ospaceship-main_40.png';

SpriteService.prototype.init = function() {
  this.sprites_ = {
    // Ships
    'mech1': {
      image: Sprite.DRAKIR,
      size: 32,
      actualSize: 36
    },
    'station': {
      image: Sprite.SPACESTATION,
      size: 32,
      actualSize: 40
    },
    'red': {
      image: Sprite.RD2,
      size: 32,
      actualSize: 36,
      offset: {x: 0, y: -2}
    },
    'mech_boss': {
      image: Sprite.TRI,
      size: 80,
      actualSize: 120
    },
    'alien1': {
      image: Sprite.ALIEN1,
      size: 36,
      actualSize: 40
    },
    'alien4': {
      image: Sprite.ALIEN2,
      size: 52,
      actualSize: 60,
      offset: {x: 0, y: 6}
    },
    'alien3': {
      image: Sprite.ALIEN3,
      size: 34,
      actualSize: 47,
      offset: {x: 0, y: 5}
    },
    'alien2': {
      image: Sprite.ALIEN4,
      size: 32,
      actualSize: 46,
      offset: {x: 0, y: 5}
    },
    'alien_boss': {
      image: Sprite.ALIENSHIPTEX,
      size: 100,
      actualSize: 136,
      offset: {x: 0, y: -9}
    },
    'brown': {
      image: Sprite.OSPACESHIP,
      size: 30,
      actualSize: 40
    }
  };

  // Items
  _.each({
    'shotgun' : {image: Sprite.RD2},
    'basic laser': {image: Sprite.RD2},
    'alien laser': {image: Sprite.RD2},
    'alien gatling': {image: Sprite.RD2},
    'alien burst': {image: Sprite.RD2},
    'alien sniper': {image: Sprite.RD2},
    'alien doubleshot': {image: Sprite.RD2},
    'alien grenade': {image: Sprite.RD2},
    'alien stinger': {image: Sprite.RD2},
    'alien blades': {image: Sprite.RD2},

    'pistol': {image: Sprite.RD2},
    'alien spawn': {image: Sprite.RD2},
    'charge': {image: Sprite.RD2},
    'alien emp': {image: Sprite.RD2},
    'emp': {image: Sprite.RD2},
    'pull': {image: Sprite.RD2},
    'alien stun': {image: Sprite.RD2},

    'knockback': {image: Sprite.RD2},
    'alien knockback': {image: Sprite.RD2},
    'shield': {image: Sprite.RD2},
    'haze': {image: Sprite.RD2},

    'dash': {image: Sprite.RD2},
    'teleport': {image: Sprite.RD2},
    'sticky': {image: Sprite.RD2}

  }, function(info, name) {
    info.size = Size.ITEM;
    info.actualSize = 36;
    this.sprites_[name] = info;
  }, this);
};

SpriteService.prototype.getSize = function(name) {
  if (!PROD) _.assert(this.sprites_[name]);
  return this.sprites_[name].size;
};

SpriteService.prototype.draw = function(name, x, y, opt_options) {
  if (!PROD) _.assert(this.sprites_[name]);
  var options = opt_options || {};
  options.rotation = options.rotation || 0;
  options.rotation += Math.PI / 2;
  var sprite = this.sprites_[name];
  var size = sprite.actualSize || sprite.size;

  if (options.radius && options.radius * 2 != sprite.size) {
    options.scale = options.radius * 2 / sprite.size;
  }

  if (!options.noOffset && sprite.offset) {
    x += sprite.offset.y * Math.cos(options.rotation + Math.PI / 2);
    y += sprite.offset.y * Math.sin(options.rotation + Math.PI / 2);
  }

  var ctx = this.ctx_;
  if (options.ctx == 'text') {
    ctx = this.textCtx_;
    x = Math.round(x * this.screen_.upscale);
    y = Math.round(y * this.screen_.upscale);
    options.scale = (options.scale || 1) * this.screen_.upscale;
  }

  ctx.translate(x, y);
  if (options.rotation) ctx.rotate(options.rotation);
  if (options.scale) ctx.scale(options.scale, options.scale);
  ctx.globalAlpha = options.alpha;
  ctx.drawImage(sprite.image, -size / 2, -size / 2);
  ctx.globalAlpha = 1;
  if (options.scale) ctx.scale(1/options.scale, 1/options.scale);
  if (options.rotation) ctx.rotate(-options.rotation);
  ctx.translate(-x, -y);
};
