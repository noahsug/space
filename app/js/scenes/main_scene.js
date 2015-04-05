var MainScene = di.service('MainScene', [
  'GameModel as gm', 'Scene', 'LayoutElement', 'RoundBtnElement', 'BtnElement',
  'LabelElement', 'World']);

MainScene.prototype.init = function() {
  _.class.extend(this, this.scene_.create('main'));
};

MainScene.prototype.addEntities_ = function() {
  this.layout_ = this.layoutElement_.create({direction: 'vertical'});

  this.layout_.addFlex();

  // Lives label.
  var labelRow = this.layout_.addNew(this.layoutElement_);
  labelRow.layout.align = 'top';
  labelRow.childHeight = Size.TEXT + Padding.LEVEL;
  var livesLabel = labelRow.addNew(this.labelElement_);
  livesLabel.setText('World ' + (this.gm_.world.index + 1),
                     {size: Size.TEXT, align: 'left', baseline: 'top'});
  labelRow.addGap(Padding.LEVEL * 4 + Size.LEVEL * 5);

  // Levels.
  for (var row = 0; row < this.gm_.world.rows; row++) {
    if (row) this.layout_.addGap(Padding.LEVEL);
    var levelRow = this.layout_.addNew(this.layoutElement_);
    levelRow.childHeight = Size.LEVEL;
    for (var col = 0; col < this.gm_.world.cols; col++) {
      if (col) levelRow.addGap(Padding.LEVEL);
      levelRow.add(this.createBtn_(row, col));
    }
  }

  this.layout_.addFlex();

  // Back button.
  var btnRow = this.layout_.addNew(this.layoutElement_);
  btnRow.setAlign('left');
  btnRow.layout.align = 'top';
  btnRow.childHeight = Size.TEXT + Padding.BOT;
  var backBtn = btnRow.addNew(this.btnElement_);
  backBtn.layout.align = 'left';
  backBtn.padding.left = Padding.MD;
  backBtn.setText('back', {size: Size.TEXT});
  backBtn.setLineDirection('left');
  backBtn.onClick(function() {
    this.transition_('worldSelect');
  }.bind(this));
};

MainScene.prototype.createBtn_ = function(row, col) {
  var btn = this.roundBtnElement_.create();
  btn.setSize(Size.LEVEL);

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

MainScene.prototype.update_ = function(dt, state) {
  this.layout_.update();
};
