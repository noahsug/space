var WorldSelectScene = di.service('WorldSelectScene', [
  'GameModel as gm', 'Scene', 'LayoutElement', 'RoundBtnElement',
  'EntityElement', 'World']);

WorldSelectScene.prototype.init = function() {
  _.class.extend(this, this.scene_.create('main'));
};

WorldSelectScene.prototype.addEntities_ = function() {
  //this.entityElement_.create('worldSelectSplash');

  var layouts = [];
  for (var row = 0; row < World.ROWS; row++) {
    var layout = this.layoutElement_.create();
    layout.layout.flex = 1;
    layout.layout.align = 'center';
    layouts.push(layout);
    for (var col = 0; col < World.COLS; col++) {
      layout.add(this.createBtn_(row, col));
    }
  }

  this.layout_ = this.layoutElement_.create({direction: 'horizontal'});

  var worldLayout = this.layoutElement_.create({direction: 'vertical'});
  worldLayout.layout.flex = 1;



  var miscLayout = this.layoutElement_.create({direction: 'vertical'});
  miscLayout.layout.flex = 2;
};

WorldSelectScene.prototype.createBtn_ = function(row, col) {
  var btn = this.roundBtnElement_.create();
  btn.padding.right = 20;
  btn.setSize('level');

  var level = this.world_.get(row, col);
  btn.setProp('level', level);

  if (level.state == 'unlocked') {
    btn.onClick(function() {
      this.gm_.level = level;
      this.transition_('equipOptions');
    }.bind(this));
  }
  return btn;
};

WorldSelectScene.prototype.update_ = function(dt, state) {
  this.layout_.update();
};
