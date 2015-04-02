var WorldSelectScene = di.service('WorldSelectScene', [
  'GameModel as gm', 'Scene', 'LayoutElement', 'RoundBtnElement',
  'LabelElement', 'World']);

WorldSelectScene.prototype.init = function() {
  _.class.extend(this, this.scene_.create('worldSelect'));
};

WorldSelectScene.prototype.addEntities_ = function() {
  this.layout_ = this.layoutElement_.create({direction: 'vertical'});
  this.layout_.padding.top = -Size.TEXT - Padding.SM + Padding.MD + Size.LEVEL;

  // World select label.
  var labelRow = this.layout_.addNew(this.layoutElement_);
  labelRow.layout.align = 'top';
  labelRow.childHeight = Size.TEXT + Padding.SM;
  var worldLabel = labelRow.addNew(this.labelElement_);
  worldLabel.setText('select world:',
                     {size: Size.TEXT, align: 'left', baseline: 'top'});
  labelRow.addGap(Padding.SM * 2 + Size.LEVEL * 3);

  // Worlds.
  for (var i = 0; i < this.gm_.worlds.length; i += 3) {
    if (i) this.layout_.addGap(Padding.SM);
    var row = this.layout_.addNew(this.layoutElement_);
    row.add(this.createWorldBtn_(this.gm_.worlds[i]));
    row.addGap(Padding.SM);
    row.add(this.createWorldBtn_(this.gm_.worlds[i + 1]));
    row.addGap(Padding.SM);
    row.add(this.createWorldBtn_(this.gm_.worlds[i + 2]));
    row.childHeight = Size.LEVEL;
  }

  this.layout_.addGap(Padding.MD);

  // Sandbox + ranked.
  var row = this.layout_.addNew(this.layoutElement_);
  row.setPadding(0, Padding.LEVEL);
  row.addFlex();
  var sandboxBtn = row.addNew(this.roundBtnElement_);
  sandboxBtn.setSize(Size.LEVEL);
  sandboxBtn.setProp('text', 'sandbox');

  row.addFlex();

  var rankedBtn = row.addNew(this.roundBtnElement_);
  rankedBtn.setSize(Size.LEVEL);
  rankedBtn.setProp('text', 'ranked');
  row.childHeight = Size.LEVEL;
  row.addFlex();
};

WorldSelectScene.prototype.createWorldBtn_ = function(world) {
  var btn = this.roundBtnElement_.create();
  btn.setStyle('world');
  btn.setSize('level');
  btn.setProp('level', world);

  if (world.state != 'locked') {
    btn.onClick(function() {
      this.gm_.world = world;
      this.transition_('main');
    }.bind(this));
  }
  return btn;
};

WorldSelectScene.prototype.update_ = function(dt, state) {
  this.layout_.update();
};
