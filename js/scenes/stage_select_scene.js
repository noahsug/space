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
    .addFlex()

    .modify(this.addStages_, this)

    .addFlex()

    .add(this.LayoutElement_.new('horizontal')
      .add(this.LabelElement_.new()
        .setText('retreat', Size.BUTTON)
        .setBg('primary', Padding.BUTTON_BG)
        .onClick(this.retreat_, this))
      .addFlex()
      .add(this.LabelElement_.new()
        .setText('equip', Size.BUTTON)
        .setBg('primary', Padding.BUTTON_BG)
        .onClick(this.openModal_.bind(this, 'equip'))));

  if (_.is(this.gm_.event.state, 'won', 'lost')) {
    this.openModal_('missionResult');
  }

  this.fadeFromBlack_();
};

StageSelectScene.prototype.retreat_ = function() {
  this.gm_.event.state = 'lost';
  this.goBackTo_('missionSelect');
};

StageSelectScene.prototype.addStages_ = function(layout) {
  for (var row = this.gm_.mission.stages.length - 1; row >= 0; row--) {
    if (row != this.gm_.mission.stages.length - 1) {
      layout.addGap(Padding.MARGIN_SM);
    }
    var stageRow = this.LayoutElement_.new('horizontal');
    stageRow.setChildrenBaselineAlign('middle', 'center');
    for (var col = 0; col < this.gm_.mission.stages[row].length; col++) {
      if (col) stageRow.addGap(Padding.STAGE);
      stageRow.add(this.createStageBtn_(row, col));
    }
    layout.add(stageRow);
  }
};

StageSelectScene.prototype.createStageBtn_ = function(row, col) {
  var btn = this.ItemElement_.new();
  var stage = this.gm_.mission.stages[row][col];

  if (stage.empty) {
    btn.setSize(Size.STAGE / 2);
    return btn;
  }

  if (this.spriteService_.getSize(stage.hull.spec.sprite) < 60) {
    btn.setSize(Size.STAGE);
  } else {
    btn.setSize(Size.STAGE_LG);
  }

  switch(stage.state) {
  case 'won':
    if (this.gm_.stage == stage) {
      btn.animate('alpha', 0, {duration: 1.5});
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

  btn.setProp('stage', stage);
  return btn;
};

StageSelectScene.prototype.createPlayerBtn_ = function() {
  return this.ItemElement_.new()
    .setSize(Size.STAGE)
    .setProp('stage', {hull: this.inventory_.getHull()});
};

StageSelectScene.prototype.onTransition_ = function() {
  this.Scene_.onTransition_.call(this);
  this.fadeToBlack_();
};
