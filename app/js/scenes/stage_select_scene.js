var StageSelectScene = di.service('StageSelectScene', [
  'GameModel as gm', 'Scene', 'LayoutElement', 'ItemElement',
  'LabelElement', 'Inventory', 'Gameplay', 'SpriteService']);

StageSelectScene.prototype.init = function() {
  di.extend(this, this.Scene_, 'stageSelect');
};

StageSelectScene.prototype.addEntities_ = function() {
  this.layout_ = this.LayoutElement_.new('vertical')
    .setChildrenFill(true)
    .setPadding(Padding.MARGIN)

    .add(this.LayoutElement_.new('horizontal')
      .add(this.LabelElement_.new()
        .setText(this.gm_.mission.title, Size.HEADING_SM)
        .setStyle('muted')
        .setBg('muted', Padding.HEADING_SM_BG))
      .addFlex()
      .add(this.LabelElement_.new()
        .setText('rewinds: ' + this.gm_.mission.lives, Size.DESC)
        .setBg('muted', Padding.DESC_BG)))

    .addFlex()

    .modify(this.addStages_, this)

    .addFlex()

    .add(this.LayoutElement_.new('horizontal')
      .setChildrenAlign('center')
      .add(this.createPlayerBtn_()))

    .addFlex()

    .add(this.LayoutElement_.new('horizontal')
      .add(this.LabelElement_.new()
        .setText('back', Size.BUTTON)
        .setBg('primary', Padding.BUTTON_BG)
        .onClick(this.goBack_, this))
      .addFlex()
      .add(this.LabelElement_.new()
        .setText('equip', Size.BUTTON)
        .setBg('primary', Padding.BUTTON_BG)
        .onClick(this.openModal_.bind(this, 'equip'))));

  if (_.is(this.gm_.mission.state, 'won', 'lost')) {
    this.openModal_('missionResult');
  }
};

StageSelectScene.prototype.addStages_ = function(layout) {
  for (var row = this.gm_.mission.stages.length - 1; row >= 0; row--) {
    if (row != this.gm_.mission.stages.length - 1) {
      layout.addGap(Padding.MARGIN_SM);
    }
    var stageRow = this.LayoutElement_.new('horizontal');
    stageRow.setChildrenBaselineAlign('middle', 'center');
    for (var col = 0; col < this.gm_.mission.stages[row].length; col++) {
      if (col) stageRow.addFlex();
      stageRow.add(this.createStageBtn_(row, col));
    }
    layout.add(stageRow);
  }
};

StageSelectScene.prototype.createStageBtn_ = function(row, col) {
  var btn = this.ItemElement_.new();
  var stage = this.gm_.mission.stages[row][col];
  btn.setProp('stage', stage);

  if (stage.empty) {
    btn.setSize(Size.STAGE / 2);
  } else if (this.spriteService_.getSize(stage.hull.spec.sprite) < 60) {
    btn.setSize(Size.STAGE);
  } else {
    btn.setSize(Size.STAGE_LG);
  }

  switch(stage.state) {
  case 'won':
    if (this.gm_.stage == stage) {
      btn.animate('alpha', 0);
    } else {
      btn.setStyle('hidden');
    }
    break;
  case 'locked': btn.setStyle('locked'); break;
  case 'unlocked':
    btn.onClick(function() {
      this.gm_.stage = stage;
      this.openModal_('shipDetails');
    }, this);
  }
  return btn;
};

StageSelectScene.prototype.createPlayerBtn_ = function() {
  return this.ItemElement_.new()
    .setSize(Size.STAGE)
    .setProp('stage', {hull: this.inventory_.getHull()});
};
