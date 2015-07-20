var SpriteService = di.service('SpriteService', ['ctx', 'textCtx', 'Screen']);

var Sprite = {};
// Ships
loadImage('DRAKIR', 'drakir_36');
loadImage('SPACESTATION', 'spacestation_40');
loadImage('RD2', 'RD2_36');
loadImage('TRI', 'tri_120');
loadImage('ALIEN1', 'alien1_40');
loadImage('ALIEN2', 'alien2_60');
loadImage('ALIEN3', 'alien3_47');
loadImage('ALIEN4', 'alien4_46');
loadImage('ALIENSHIPTEX', 'alienshiptex_136');
loadImage('OSPACESHIP', 'ospaceship-main_40');

// Items
loadImage('STRIKING_DIAMONDS', 'striking_diamonds_32');
loadImage('STRIKING_DIAMONDS_BASIC', 'striking_diamonds_basic_32');
loadImage('STRIKING_BALLS', 'striking_balls_32');
loadImage('STRIKING_BALL_PISTOL', 'striking_ball_pistol_32');
loadImage('ON_TARGET', 'on_target_32');
loadImage('AFTERBURN', 'afterburn_32');
loadImage('SHIELD', 'forward_field_32');
loadImage('REFLECT', 'shield_reflect_32');
loadImage('ENERGISE', 'energise_32');
loadImage('ELECTRIC', 'electric_32');
loadImage('STRAFE', 'strafe_32');
loadImage('REFRESH', 'cycle_32');
loadImage('WIND_SLAP', 'wind_slap_32');
loadImage('TELEPORT', 'teleport_32');
loadImage('SENTRY_GUN', 'sentry_gun_32');
loadImage('MISSILE_SWARM', 'missile_swarm_32');
loadImage('SNIPER', 'gunshot_32');
loadImage('CLONE', 'telepathy_32');
loadImage('TEMPORAL_HOLE', 'abstract_024');

function loadImage(name, src) {
  Sprite[name] = new Image();
  Sprite[name].src = 'assets/' + src + '.png';
};

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
    'shotgun': 'STRIKING_BALLS',
    'charge laser': 'STRIKING_DIAMONDS',
    'alien sniper': 'SNIPER',
    'alien shotgun' : 'STRIKING_BALLS',

    'charge': 'AFTERBURN',
    'knockback': 'WIND_SLAP',

    'temporal hole': 'TEMPORAL_HOLE',

    'basic laser': 'STRIKING_DIAMONDS_BASIC',
    'burst laser': 'STRIKING_DIAMONDS',
    'missiles': 'MISSILE_SWARM',
    'sniper': 'SNIPER',
    'alien laser': 'STRIKING_DIAMONDS_BASIC',
    'alien gatling': 'STRIKING_DIAMONDS_BASIC',  // No image
    'alien burst': 'STRIKING_DIAMONDS',
    'alien doubleshot': 'STRIKING_DIAMONDS_BASIC',  // No image
    'alien grenade': 'STRIKING_DIAMONDS_BASIC',  // No image
    'alien stinger': 'STRIKING_DIAMONDS_BASIC',
    'alien blades': 'STRIKING_DIAMONDS_BASIC',  // No image

    'pistol': 'STRIKING_BALL_PISTOL',
    'tracker': 'ON_TARGET',
    'alien spawn': 'STRAFE',
    'alien emp': 'ENERGISE',
    'emp': 'ENERGISE',
    'pull': 'STRIKING_BALL_PISTOL',  // No image
    'turret': 'SENTRY_GUN',
    'stun': 'ELECTRIC',
    'alien stun': 'ELECTRIC',

    'alien knockback': 'WIND_SLAP',
    'shield': 'SHIELD',
    'haze': 'STRIKING_BALL_PISTOL',  // No image
    'reflect': 'REFLECT',

    'dash': 'TELEPORT',  // No image
    'refresh': 'REFRESH',
    'teleport': 'TELEPORT',
    'divide': 'CLONE',
    'sticky': 'TELEPORT'  // No image

  }, function(sprite, name) {
    this.sprites_[name] = {
      image: Sprite[sprite],
      size: Size.ITEM,
      actualSize: 32
    };
  }, this);
};

SpriteService.prototype.getSize = function(name) {
  if (!PROD) _.assert(this.sprites_[name]);
  return this.sprites_[name].size;
};

SpriteService.prototype.getActualSize = function(name) {
  if (!PROD) _.assert(this.sprites_[name]);
  return this.sprites_[name].actualSize;
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
