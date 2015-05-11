var SpriteService = di.service('SpriteService', ['ctx']);

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

SpriteService.prototype.sprites_ = {
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

  this.ctx_.translate(x, y);
  if (options.rotation) this.ctx_.rotate(options.rotation);
  if (options.scale) this.ctx_.scale(options.scale, options.scale);
  if (options.alpha) this.ctx_.globalAlpha = options.alpha;
  this.ctx_.drawImage(sprite.image, -size / 2, -size / 2);
  if (options.alpha) this.ctx_.globalAlpha = 1;
  if (options.scale) this.ctx_.scale(1/options.scale, 1/options.scale);
  if (options.rotation) this.ctx_.rotate(-options.rotation);
  this.ctx_.translate(-x, -y);
};
