var StageResultScene = di.service('StageResultScene', [
  'GameModel as gm', 'Scene', 'LayoutElement', 'BackdropElement', 'ItemService',
  'LabelElement', 'MissionService', 'BattleRewards', 'ItemElement',
  'FadeElement']);

StageResultScene.prototype.init = function() {
  di.extend(this, this.Scene_, 'stageResult');
};

StageResultScene.prototype.onStart_ = function() {
  this.reward_ = this.battleRewards_.rewardPlayer();
};

StageResultScene.prototype.addEntities_ = function() {
  this.layout_ = this.LayoutElement_.new('vertical')
    .add(this.BackdropElement_.new())
    .setPadding(Padding.MODAL_MARGIN)
    .setPadding('bottom', Padding.MODAL_MARGIN - Padding.BUTTON_BG)
    .setChildrenBaselineAlign('middle', 'center')

  // Title
  .add(this.LabelElement_.new()
    .setText(this.getTitleText_(), this.getTitleSize_())
    .setStyle('muted')
    .setPadding('bottom', Padding.MARGIN * 1.5));

  if (this.reward_) {
    // Reward
    this.layout_.add(this.LayoutElement_.new('vertical')
      .add(this.UiElement_.new().setPadding('left', Size.ITEM_DESC_WIDTH))
      .setBgStyle('muted_dark')
      .setBorderStyle('primary')
      .setPadding(Padding.MODAL_MARGIN_SM)
      // Unlock text
      .add(this.LabelElement_.new()
        .setLayoutAlign('center')
        .setText('unlocked new ' +
                 Strings.ItemType[this.reward_.category] + ':', 12)
        .setStyle('muted'))

      // Reward item
      .add(this.ItemElement_.new()
        .setPadding('top', Padding.ITEM)
        .setLayoutAlign('center')
        .setProp('item', this.reward_)
        .setSize(Size.ITEM))

      // Item desc.
      .add(this.LabelElement_.new()
         .setText(this.reward_.displayName, Size.DESC_SM)
         .setStyle('muted')
         .setBg('primary', Padding.DESC_SM_BG))
      .add(this.LabelElement_.new()
         .setLayoutFill(true)
         .setText(this.itemService_.getDesc(this.reward_), Size.DESC_SM)
         .setNumLines(2)
         .setLineWrap(true)
         .setStyle('muted')
         .setBg('none', Padding.DESC_SM_BG)));
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
  if (this.gm_.event.state == 'won') return 'mission complete';
  if (this.gm_.event.state == 'lost') return 'mission failed';
  if (this.gm_.stage.state == 'won') return 'victory';
  return 'defeat';
};

StageResultScene.prototype.getTitleSize_ = function() {
  if (_.is(this.gm_.event.state, 'won', 'lost')) {
    return 24;
  }
  return 43;
};

StageResultScene.prototype.getRewindText_ = function() {
  var lives = this.gm_.mission.lives;
  return lives + ' rewind' + (lives == 1 ? '' : 's') + ' remaining';
};

StageResultScene.prototype.getBtnText_ = function() {
  if (this.missionService_.beatGame()) return 'exit';
  if (_.is(this.gm_.event.state, 'won', 'lost')) {
    return 'return to earth';
  }
  if (this.gm_.stage.state == 'won') return 'continue';
  return 'rewind';
};

StageResultScene.prototype.getNextScene_ = function() {
  if (this.missionService_.beatGame()) return 'intro';
  if (_.is(this.gm_.event.state, 'won', 'lost')) {
    return 'missionSelect';
  }
  return 'stageSelect';
};

StageResultScene.prototype.onTransition_ = function() {
  this.Scene_.onTransition_.call(this);
  this.fadeToBlack_();
};
