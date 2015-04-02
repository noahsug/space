var MainScene = di.service('MainScene', [
  'GameModel as gm', 'Scene', 'LayoutElement', 'RoundBtnElement', 'BtnElement',
  'LabelElement', 'World']);

MainScene.prototype.init = function() {
  _.class.extend(this, this.scene_.create('main'));
};

MainScene.prototype.addEntities_ = function() {
  this.layout_ = this.layoutElement_.create({direction: 'vertical'});
  this.layout_.padding.top = -Padding.SM + Padding.BOT;

  this.layout_.addFlex();

  // Lives label.
  var labelRow = this.layout_.addNew(this.layoutElement_);
  labelRow.layout.align = 'top';
  labelRow.childHeight = Size.TEXT + Padding.SM;
  var livesLabel = labelRow.addNew(this.labelElement_);
  livesLabel.setText('World ' + (this.gm_.world.index + 1),
                     {size: Size.TEXT, align: 'left'});
  labelRow.addGap(Padding.SM * 2 + Size.LEVEL * 3);

  // Levels.
  for (var row = 0; row < this.gm_.world.rows; row++) {
    if (row) this.layout_.addGap(Padding.SM);
    var levelRow = this.layout_.addNew(this.layoutElement_);
    levelRow.childHeight = Size.LEVEL;
    for (var col = 0; col < this.gm_.world.cols; col++) {
      if (col) levelRow.addGap(Padding.SM);
      levelRow.add(this.createBtn_(row, col));
    }
  }

  this.layout_.addFlex();

  // Back button.
  var btnRow = this.layout_.addNew(this.layoutElement_);
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
  btnRow.addFlex(1);
};

MainScene.prototype.createBtn_ = function(row, col) {
  var btn = this.roundBtnElement_.create();
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

MainScene.prototype.update_ = function(dt, state) {
  this.layout_.update();
};
