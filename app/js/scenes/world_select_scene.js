var WorldSelectScene = di.service('WorldSelectScene', [
  'GameModel as gm', 'Scene', 'LayoutElement', 'RoundBtnElement',
  'LabelElement', 'World', 'Inventory']);

WorldSelectScene.prototype.init = function() {
  _.class.extend(this, this.scene_.create('worldSelect'));
};

WorldSelectScene.prototype.addEntities_ = function() {
  var COLS = 4;  // Number of columns in the world grid.

  this.layout_ = this.layoutElement_.create({direction: 'vertical'});

  // World select label.
  var labelRow = this.layout_.addNew(this.layoutElement_);
  labelRow.layout.align = 'top';
  labelRow.childHeight = Size.TEXT + Padding.WORLD * 1.5;
  var worldLabel = labelRow.addNew(this.labelElement_);
  worldLabel.setText('select world:',
                     {size: Size.TEXT, align: 'left', baseline: 'top'});
  labelRow.addGap(Padding.WORLD * (COLS - 1) + Size.WORLD * COLS);

  // Worlds.
  for (var i = 0; i < this.gm_.worlds.length; i += COLS) {
    if (i) this.layout_.addGap(Padding.WORLD);
    var row = this.layout_.addNew(this.layoutElement_);
    row.add(this.createWorldBtn_(this.gm_.worlds[i]));
    row.addGap(Padding.WORLD);
    row.add(this.createWorldBtn_(this.gm_.worlds[i + 1]));
    row.addGap(Padding.WORLD);
    row.add(this.createWorldBtn_(this.gm_.worlds[i + 2]));
    row.addGap(Padding.WORLD);
    row.add(this.createWorldBtn_(this.gm_.worlds[i + 3]));
    row.childHeight = Size.WORLD;
  }

  this.layout_.addGap(Padding.WORLD * 3);

  // Sandbox + ranked.
  //var btnRow = this.layout_.addNew(this.layoutElement_);
  //var sandboxBtn = btnRow.addNew(this.roundBtnElement_);
  //sandboxBtn.setSize(Size.WORLD);
  //sandboxBtn.setProp('text', 'sandbox');
  //sandboxBtn.setStyle('locked');
  //
  //btnRow.addGap(Size.WORLD);
  //
  //var rankedBtn = btnRow.addNew(this.roundBtnElement_);
  //rankedBtn.setSize(Size.WORLD);
  //rankedBtn.setProp('text', 'ranked');
  //rankedBtn.setStyle('locked');
  //
  //btnRow.childHeight = Size.WORLD;
};

WorldSelectScene.prototype.createWorldBtn_ = function(world) {
  var btn = this.roundBtnElement_.create();
  btn.setStyle('world');
  btn.setSize(Size.WORLD);
  btn.setProp('level', world);

  if (world.state == 'unlocked') {
    btn.onClick(function() {
      this.gm_.world = world;
      this.inventory_.removeAugments();
      this.gm_.player.push.apply(this.gm_.player, this.gm_.world.augments);
      this.transition_('main');
    }.bind(this));
  }
  return btn;
};

WorldSelectScene.prototype.update_ = function(dt, state) {
  this.layout_.update();
};
