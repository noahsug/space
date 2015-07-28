var StageResultScene = di.service('StageResultScene', [
  'GameModel as gm', 'Scene', 'LayoutElement', 'BackdropElement', 'ItemService',
  'LabelElement', 'MissionService', 'EntityElement', 'ItemDescElement',
  'FadeElement']);

StageResultScene.prototype.init = function() {
  di.extend(this, this.Scene_, 'stageResult');
};

StageResultScene.prototype.addEntities_ = function() {
  this.layout_ = this.LayoutElement_.new('vertical')
    .add(this.BackdropElement_.new())
    .setPadding(Padding.MODAL_MARGIN)
    .setPadding('bottom', Padding.MODAL_MARGIN - Padding.BUTTON_BG)
    .setChildrenFill(true)
    .setChildrenBaselineAlign('middle', 'center')

  // Title
  .add(this.LabelElement_.new()
    .setText(this.getTitleText_(), this.getTitleSize_())
    .setStyle('muted')
    .setPadding('bottom', Padding.MARGIN * 1.5));

  var reward = this.gm_.stage.reward && this.gm_.stage.reward.value;
  if (this.gm_.mission.state == 'won' && reward) {
    // Reward
    this.layout_.add(this.LayoutElement_.new('vertical')
      .setBgStyle('muted_dark')
      .setBorderStyle('primary')
      .setPadding(Padding.MODAL_MARGIN_SM)

      // Unlock text
      .add(this.LabelElement_.new()
        .setLayoutAlign('center')
        .setText('unlocked new ' +
                 Strings.ItemType[reward.category] + ':', 12)
        .setStyle('muted'))

      // Reward item
      .add(this.EntityElement_.new('item')
        .setPadding(Padding.ITEM / 2, 0, Padding.ITEM / 4)
        .setLayoutAlign('center')
        .setProp('item', reward)
        .setSize(Size.ITEM))

      // Item desc.
      .add(this.ItemDescElement_.new()
         .setItem(reward)));
  }

  this.layout_
    .addGap(Padding.MARGIN * 2)

    // Continue button
    .add(this.LabelElement_.new()
      .setText(this.getBtnText_(), Size.BUTTON)
      .setBg('primary', Padding.BUTTON_BG)
      .onClick(this.goBackTo_.bind(this, this.getNextScene_())));

  this.fadeIn_();
};

StageResultScene.prototype.getTitleText_ = function() {
  if (this.missionService_.beatGame()) return 'you win';
  if (this.gm_.mission.state == 'won') return 'mission complete';
  if (this.gm_.mission.state == 'lost') return 'mission failed';
  if (this.gm_.stage.state == 'won') return 'victory';
  return 'defeat';
};

StageResultScene.prototype.getTitleSize_ = function() {
  if (_.oneOf(this.gm_.mission.state, 'won', 'lost')) return 23;
  return 43;
};

StageResultScene.prototype.getBtnText_ = function() {
  if (this.missionService_.beatGame()) return 'exit';
  return 'continue';
};

StageResultScene.prototype.getNextScene_ = function() {
  if (this.missionService_.beatGame()) return 'intro';
  if (_.oneOf(this.gm_.mission.state, 'won', 'lost')) {
    return 'worldSelect';
  }
  return 'stageSelect';
};

StageResultScene.prototype.onTransition_ = function() {
  this.Scene_.onTransition_.call(this);
  this.fadeToBlack_();
};
