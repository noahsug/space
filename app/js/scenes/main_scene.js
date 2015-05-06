var MainScene = di.service('MainScene', [
  'GameModel as gm', 'Scene', 'LayoutElement', 'RoundBtnElement', 'BtnElement',
  'LabelElement', 'World', 'Inventory', 'Gameplay', 'SpriteService']);

MainScene.prototype.init = function() {
  _.class.extend(this, this.scene_.create('main'));
};

MainScene.prototype.addEntities_ = function() {
  var COLS = 4;
  this.layout_ = this.layoutElement_.create({direction: 'vertical'});

  this.layout_.addGap(Padding.TOP);

  // World label.
  var titleRow = this.layout_.addNew(this.layoutElement_);
  titleRow.layout.align = 'top';
  titleRow.childHeight = Size.TEXT_LG;
  var titleLabel = titleRow.addNew(this.labelElement_);
  titleLabel.setText('World ' + (this.gm_.world.index + 1),
                     {size: Size.TEXT_LG, align: 'left', baseline: 'top'});
  titleRow.addGap(Padding.STAGE * (COLS - 1) + Size.STAGE * COLS);

  this.layout_.addGap(Padding.TEXT);

  var livesRow = this.layout_.addNew(this.layoutElement_);
  livesRow.layout.align = 'top';
  livesRow.childHeight = Size.TEXT;
  var livesLabel = livesRow.addNew(this.labelElement_);
  livesLabel.setText('Lives: ' + this.gm_.world.lives,
                     {size: Size.TEXT, align: 'left', baseline: 'top'});
  livesRow.addGap(Padding.STAGE * (COLS - 1) + Size.STAGE * COLS);

  this.layout_.addFlex();

  // Stages.
  for (var row = this.gm_.world.stages.length - 1; row >= 0; row--) {
    if (row < this.gm_.world.stages.length - 1) {
      this.layout_.addGap(Padding.STAGE);
    }
    var stageRow = this.layout_.addNew(this.layoutElement_);
    for (var col = 0; col < this.gm_.world.stages[row].length; col++) {
      if (col) stageRow.addGap(Padding.STAGE);
      var btn = this.createBtn_(row, col);
      stageRow.add(btn);
      stageRow.childHeight = Math.max(btn.getSize(), stageRow.childHeight || 0);
    }
  }

  this.layout_.addFlex();

  // Player ship.
  var playerRow = this.layout_.addNew(this.layoutElement_);
  playerRow.childHeight = Size.STAGE;
  playerRow.add(this.createPlayerShipBtn_());

  this.layout_.addFlex(.5);

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

MainScene.prototype.createPlayerShipBtn_ = function() {
  var btn = this.roundBtnElement_.create();
  btn.setSize(Size.STAGE);
  btn.setProp('stage', {hull: this.inventory_.getHull()});
  btn.onClick(function() {
    this.gm_.equipping = 'primary';
    this.transition_('equip');
  }.bind(this));
  return btn;
};

MainScene.prototype.createBtn_ = function(row, col) {
  var btn = this.roundBtnElement_.create();
  var stage = this.gm_.world.stages[row][col];
  btn.setProp('stage', stage);

  if (stage.empty) {
    btn.setSize(Size.STAGE / 2);
  } else if (this.spriteService_.getSize(stage.hull.spec.sprite) < 60) {
    btn.setSize(Size.STAGE);
  } else {
    btn.setSize(Size.STAGE_LARGE);
  }

  if (stage.state == 'unlocked') {
    btn.onClick(function() {
      this.gm_.stage = stage;
      this.transition_('equipOptions');
    }.bind(this));
  }
  return btn;
};

MainScene.prototype.update_ = function(dt, state) {
  this.layout_.update();
};
