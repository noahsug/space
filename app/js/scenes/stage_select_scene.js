var StageSelectScene = di.service('StageSelectScene', [
  'GameModel as gm', 'Scene', 'LayoutElement', 'StageElement', 'UiElement',
  'LabelElement', 'Inventory', 'Gameplay', 'MissionService']);

StageSelectScene.prototype.init = function() {
  di.extend(this, this.Scene_, 'stageSelect');
};

StageSelectScene.prototype.addEntities_ = function() {
  this.layout_ = this.LayoutElement_.new('vertical')
    .setPadding(Padding.MARGIN)
    .addFlex()

    .modify(this.addStages_, this)

    .addFlex()

    .add(this.LayoutElement_.new('horizontal')
      .add(this.LabelElement_.new()
        .setText('abort', Size.BUTTON)
        .setBg('primary', Padding.BUTTON_BG)
        .onClick(this.retreat_, this))
      .addFlex());

  this.fadeFromBlack_();
};

StageSelectScene.prototype.retreat_ = function() {
  this.missionService_.resetProgress();
  this.goBackTo_('worldSelect');
};

StageSelectScene.prototype.addStages_ = function(layout) {
  _.each(this.gm_.mission.stages, function(row) {
    var stageRow = this.LayoutElement_.new('horizontal')
      .setLayoutFill(true)
      .setLayoutAlign('center');
    _.each(row, function(stage) {
      stageRow.add(this.createStageBtn_(stage));
    }, this);
    layout.add(stageRow);
  }, this);
};

StageSelectScene.prototype.createStageBtn_ = function(stage) {
  if (stage.empty) {
    return this.UiElement_.new().setPadding(Size.STAGE, Size.STAGE, 0, 0);
  }

  var btn = this.StageElement_.new().setBaselineAlign('middle', 'center');
  if (stage.state == 'unlocked') {
    btn.onClick(function() {
      this.gm_.stage = stage;
      this.transition_('prebattle');
    }, this);
  }

  btn.setProgress(StageElement.Progress[stage.prevState]);
  btn.animate('progress', StageElement.Progress[stage.state],
              {duration: 1.5});
  btn.setProp('unlocks', stage.unlocks);
  btn.setStyle(stage.checkpoint ? 'checkpoint' : '');
  stage.r = {element: btn.getEntity()};
  return btn;
};

StageSelectScene.prototype.onTransition_ = function() {
  this.Scene_.onTransition_.call(this);
  this.fadeToBlack_();
};
