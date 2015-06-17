var StageResultScene = di.service('StageResultScene', [
  'GameModel as gm', 'Scene', 'LayoutElement', 'BackdropElement',
  'LabelElement']);

StageResultScene.prototype.init = function() {
  _.class.extend(this, this.Scene_.new('stageResult'));
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
         .setPadding('bottom', Padding.MARGIN_LG))
    .add(this.LabelElement_.new()
         .setText('continue', Size.BUTTON)
         .setBg('primary', Padding.BUTTON_BG)
         .onClick(this.goBackTo_.bind(this, 'stageSelect')));
};
