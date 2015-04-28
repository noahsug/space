var SpriteService = di.service('SpriteService', ['ctx']);

var Sprite = {};
Sprite.DRAKIR = new Image();
Sprite.DRAKIR.src = 'assets/drakir_36.png';

Sprite.SPACESTATION = new Image();
Sprite.SPACESTATION.src = 'assets/spacestation_40.png';

Sprite.RD2 = new Image();
Sprite.RD2.src = 'assets/RD2_36.png';

SpriteService.prototype.sprites_ = {
  'drakir': {
    normal: Sprite.DRAKIR
  },
  'station': {
    normal: Sprite.SPACESTATION
  },
  'rd2': {
    normal: Sprite.RD2
  }
};

SpriteService.prototype.draw = function(name, x, y, opt_options) {
  var options = opt_options || {};
  var sprite = this.sprites_[name][options.size || 'normal'];

  if (options.radius && options.radius * 2 != sprite.width) {
    options.scale = options.radius * 2 / sprite.width;
  }

  if (options.align == 'left') {
    x += sprite.width / 2;
  } else if (options.align == 'right') {
    x -= sprite.width / 2;
  }

  this.ctx_.translate(x, y);
  if (options.rotation) this.ctx_.rotate(options.rotation);
  if (options.scale) this.ctx_.scale(options.scale, options.scale);;
  if (options.alpha) this.ctx_.globalAlpha = options.alpha;
  this.ctx_.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
  if (options.alpha) this.ctx_.globalAlpha = 1;
  if (options.scale) this.ctx_.scale(-options.scale, -options.scale);
  if (options.rotation) this.ctx_.rotate(-options.rotation);
  this.ctx_.translate(-x, -y);
};
