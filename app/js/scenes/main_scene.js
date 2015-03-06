var MainScene = di.service('MainScene', [
  'GameModel as gm', 'Screen', 'Scene', 'LayoutElement', 'RoundBtnElement',
  'EntityElement']);

MainScene.prototype.init = function() {
  _.class.extend(this, this.scene_.create('main'));
};

var COLS = 3;
var ROWS = 4;
var PADDING = 10;
MainScene.prototype.addEntities_ = function() {
  this.entityElement_.create('mainSplash');

  var layouts = [];
  for (var row = 0; row < ROWS; row++) {
    var layout = this.layoutElement_.create();
    layout.layout.flex = 1;
    layout.layout.align = 'bottom';
    layouts.push(layout);
    for (var col = 0; col < COLS; col++) {
      layout.add(this.createBtn_(row, col));
    }
  }

  this.layout_ = this.layoutElement_.create({direction: 'vertical'});
  this.layout_.padding.bottom = 50;
  _.each(layouts, function(layout) {
    this.layout_.add(layout);
  }, this);
};

MainScene.prototype.createBtn_ = function(row, col) {
  var size = 60;
  var btn = this.roundBtnElement_.create();
  btn.padding.right = 20;
  btn.setSize(size);

  var level = row * COLS + col;
  btn.setText(level);
  if (level == 0) btn.setStyle('done');
  if (level >= 3) btn.setStyle('locked');
  btn.onClick(function() {
    this.gm_.level = level;
    this.transition_('equip_options_scene');
  }.bind(this));
  return btn;
};

MainScene.prototype.update_ = function(dt, state) {
  this.layout_.update();
};
