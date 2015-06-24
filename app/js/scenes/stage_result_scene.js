var StageResultScene = di.service('StageResultScene', [
  'GameModel as gm', 'Scene', 'LayoutElement', 'BackdropElement',
  'LabelElement', 'MissionService']);

StageResultScene.prototype.init = function() {
  di.extend(this, this.Scene_, 'stageResult');
};

StageResultScene.prototype.addEntities_ = function() {
  this.layout_ = this.LayoutElement_.new('vertical')
    .add(this.BackdropElement_.new())
    .setPadding(Padding.MODAL_MARGIN)
    .setPadding('bottom', Padding.MODAL_MARGIN - Padding.BUTTON_BG)
    .setChildrenBaselineAlign('middle', 'center')
    .setBgStyle('muted')
    .setBorderStyle('primary')
    .add(this.LabelElement_.new()
      .setText(this.gm_.stage.state == 'won' ? 'victory' : 'defeat', 30)
      .setStyle('muted')
      .setPadding('bottom', Padding.MARGIN))
    .add(this.LabelElement_.new()
      .setText(this.getResultText_(), Size.BUTTON)
      .setBg('primary', Padding.BUTTON_BG)
      .onClick(this.goBackTo_.bind(this, 'stageSelect')));
};

StageResultScene.prototype.getResultText_ = function() {
  if (this.gm_.stage.state == 'lost' && this.gm_.mission.state != 'lost') {
    // Lost the stage, but still have rewind(s) left.
    return 'rewind';
  }
  return 'continue';
};
