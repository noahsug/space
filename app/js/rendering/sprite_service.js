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

SpriteService.prototype.sprites_ = {
  'drakir': {
    image: Sprite.DRAKIR,
    size: 32,
    actualSize: 36
  },
  'station': {
    image: Sprite.SPACESTATION,
    size: 32,
    actualSize: 40
  },
  'rd2': {
    image: Sprite.RD2,
    size: 32,
    actualSize: 36
  },
  'tri': {
    image: Sprite.TRI,
    size: 80,
    actualSize: 120
  }
};

SpriteService.prototype.getSize = function(name) {
  if (!PROD) _.assert(this.sprites_[name]);
  return this.sprites_[name].size;
};

SpriteService.prototype.draw = function(name, x, y, opt_options) {
  if (!PROD) _.assert(this.sprites_[name]);
  var options = opt_options || {};
  var sprite = this.sprites_[name];
  var size = sprite.actualSize || sprite.size;

  if (options.radius && options.radius * 2 != sprite.size) {
    options.scale = options.radius * 2 / sprite.size;
  }
  if (options.align == 'left') {
    x += sprite.size / 2;
  } else if (options.align == 'right') {
    x -= sprite.size / 2;
  }


  this.ctx_.translate(x, y);
  if (options.rotation) this.ctx_.rotate(options.rotation);
  if (options.scale) this.ctx_.scale(options.scale, options.scale);;
  if (options.alpha) this.ctx_.globalAlpha = options.alpha;
  this.ctx_.drawImage(sprite.image, -size / 2, -size / 2);
  if (options.alpha) this.ctx_.globalAlpha = 1;
  if (options.scale) this.ctx_.scale(-options.scale, -options.scale);
  if (options.rotation) this.ctx_.rotate(-options.rotation);
  this.ctx_.translate(-x, -y);
};
