var SpriteService = di.service('SpriteService', ['ctx', 'textCtx', 'Screen']);

var Sprite = {};
// Ships
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

// Items
Sprite.STRIKING_DIAMONDS = new Image();
Sprite.STRIKING_DIAMONDS.src = 'assets/striking_diamonds_32.png';

Sprite.STRIKING_DIAMONDS_BASIC = new Image();
Sprite.STRIKING_DIAMONDS_BASIC.src = 'assets/striking_diamonds_basic_32.png';

Sprite.STRIKING_BALLS = new Image();
Sprite.STRIKING_BALLS.src = 'assets/striking_balls_32.png';

Sprite.STRIKING_BALL_PISTOL = new Image();
Sprite.STRIKING_BALL_PISTOL.src = 'assets/striking_ball_pistol_32.png';

Sprite.ON_TARGET = new Image();
Sprite.ON_TARGET.src = 'assets/on_target_32.png';

Sprite.AFTERBURN = new Image();
Sprite.AFTERBURN.src = 'assets/afterburn_32.png';

Sprite.SHIELD = new Image();
Sprite.SHIELD.src = 'assets/forward_field_32.png';

Sprite.REFLECT = new Image();
Sprite.REFLECT.src = 'assets/shield_reflect_32.png';

Sprite.ENERGISE = new Image();
Sprite.ENERGISE.src = 'assets/energise_32.png';

Sprite.ELECTRIC = new Image();
Sprite.ELECTRIC.src = 'assets/electric_32.png';

Sprite.STRAFE = new Image();
Sprite.STRAFE.src = 'assets/strafe_32.png';

Sprite.REFRESH = new Image();
Sprite.REFRESH.src = 'assets/cycle_32.png';

Sprite.WIND_SLAP = new Image();
Sprite.WIND_SLAP.src = 'assets/wind_slap_32.png';

Sprite.TELEPORT = new Image();
Sprite.TELEPORT.src = 'assets/teleport_32.png';

Sprite.SENTRY_GUN = new Image();
Sprite.SENTRY_GUN.src = 'assets/sentry_gun_32.png';

Sprite.MISSILE_SWARM = new Image();
Sprite.MISSILE_SWARM.src = 'assets/missile_swarm_32.png';

Sprite.SNIPER = new Image();
Sprite.SNIPER.src = 'assets/gunshot_32.png';

Sprite.CLONE = new Image();
Sprite.CLONE.src = 'assets/telepathy_32.png';

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
    'shotgun' : {image: Sprite.STRIKING_BALLS},
    'basic laser': {image: Sprite.STRIKING_DIAMONDS_BASIC},
    'burst laser': {image: Sprite.STRIKING_DIAMONDS},
    'missiles': {image: Sprite.MISSILE_SWARM},
    'sniper': {image: Sprite.SNIPER},
    'alien laser': {image: Sprite.STRIKING_DIAMONDS_BASIC},
    'alien gatling': {image: Sprite.STRIKING_DIAMONDS_BASIC},  // No img
    'alien burst': {image: Sprite.STRIKING_DIAMONDS},
    'alien sniper': {image: Sprite.SNIPER},
    'alien doubleshot': {image: Sprite.STRIKING_DIAMONDS_BASIC},  // No img
    'alien grenade': {image: Sprite.STRIKING_DIAMONDS_BASIC},  // No img
    'alien stinger': {image: Sprite.STRIKING_DIAMONDS_BASIC},
    'alien blades': {image: Sprite.STRIKING_DIAMONDS_BASIC},  // No img

    'pistol': {image: Sprite.STRIKING_BALL_PISTOL},
    'tracker': {image: Sprite.ON_TARGET},
    'alien spawn': {image: Sprite.STRAFE},
    'charge': {image: Sprite.AFTERBURN},
    'alien emp': {image: Sprite.ENERGISE},
    'emp': {image: Sprite.ENERGISE},
    'pull': {image: Sprite.STRIKING_BALL_PISTOL},  // No img
    'turret': {image: Sprite.SENTRY_GUN},
    'stun': {image: Sprite.ELECTRIC},
    'alien stun': {image: Sprite.ELECTRIC},

    'knockback': {image: Sprite.WIND_SLAP},
    'alien knockback': {image: Sprite.WIND_SLAP},
    'shield': {image: Sprite.SHIELD},
    'haze': {image: Sprite.STRIKING_BALL_PISTOL},  // No img
    'reflect': {image: Sprite.REFLECT},

    'dash': {image: Sprite.TELEPORT},  // No img
    'refresh': {image: Sprite.REFRESH},
    'teleport': {image: Sprite.TELEPORT},
    'divide': {image: Sprite.CLONE},
    'sticky': {image: Sprite.TELEPORT}  // No img

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
