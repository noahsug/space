var StageResultScene = di.service('StageResultScene', [
  'GameModel as gm', 'Scene', 'LayoutElement', 'BackdropElement', 'ItemService',
  'LabelElement', 'MissionService', 'EntityElement', 'ItemDescElement']);

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
    .setLineWrap(true)
    .setTextAlign('center')
    .setStyle('muted')
    .setPadding('bottom', Padding.MARGIN * 2));

  var reward = this.gm_.stage.reward && this.gm_.stage.reward.value;
  if (!this.missionService_.beatGame() &&
      this.gm_.mission.state != 'lost' &&
      this.gm_.stage.state != 'lost' &&
      reward) {
    // Reward
    this.layout_.add(this.LayoutElement_.new('vertical')

      // Unlock text
      .add(this.LabelElement_.new()
        .setLayoutAlign('center')
        .setText(this.getRewardUnlockText_(), 12)
        .setStyle('muted'))

      .modify(this.addRewardElement_, this));
  }

  if (this.gm_.mission.fuel == 0) {
    this.layout_.add(this.LabelElement_.new()
      .setStyle('muted')
      .setText('no fuel remaining...', 12));
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
  if (this.missionService_.beatGame()) {
    return 'congratulations! the galaxy has been saved';
  }
  if (this.gm_.mission.state == 'won') return 'mission complete';
  if (this.gm_.mission.state == 'lost') return 'mission failed';
  if (this.gm_.stage.state == 'won') return 'victory';
  return 'defeat';
};

StageResultScene.prototype.getTitleSize_ = function() {
  if (this.missionService_.beatGame()) return 23;
  if (_.oneOf(this.gm_.mission.state, 'won', 'lost')) return 23;
  return 43;
};

StageResultScene.prototype.getRewardUnlockText_ = function() {
  var reward = this.gm_.stage.reward.value;
  if (this.gm_.stage.reward.type == 'item') {
    return 'unlocked new ' + Strings.ItemType[reward.category] + ':';
  }
  return 'discovered new world:';
};

StageResultScene.prototype.addRewardElement_ = function(layout) {
  if (this.gm_.stage.reward.type == 'item') {
    this.addItemRewardElement_(layout);
  } else {  // world
    this.addWorldRewardElement_(layout);
  }
};

StageResultScene.prototype.addItemRewardElement_ = function(layout) {
  var reward = this.gm_.stage.reward.value;
  layout
    // Reward item
    .add(this.EntityElement_.new('item')
      .setPadding(Padding.ITEM / 2, 0, Padding.ITEM / 4)
      .setLayoutAlign('center')
      .set('item', reward)
      .setSize(Size.ITEM))

    // Item desc.
    .add(this.ItemDescElement_.new()
       .setItem(reward));
};

StageResultScene.prototype.addWorldRewardElement_ = function(layout) {
  var reward = this.gm_.stage.reward.value;
  layout
    // World
    .add(this.EntityElement_.new('world')
      .setPadding('top', Padding.ITEM / 2)
      .setLayoutAlign('center')
      .setBaselineAlign('middle', 'center')
      .set('world', reward)
      .setSize(Size.WORLD));
};

StageResultScene.prototype.getBtnText_ = function() {
  if (this.missionService_.beatGame()) return 'exit';
  if (this.gm_.stage.tutorial && this.gm_.stage.state == 'lost') return 'retry';
  return 'continue';
};

StageResultScene.prototype.getNextScene_ = function() {
  if (this.missionService_.beatGame()) return 'intro';
  if (this.gm_.stage.tutorial && this.gm_.stage.state == 'lost') {
    return 'prebattle';
  }
  if (_.oneOf(this.gm_.mission.state, 'won', 'lost')) {
    return 'worldSelect';
  }
  return 'stageSelect';
};

StageResultScene.prototype.onTransition_ = function() {
  this.Scene_.onTransition_.call(this);
  this.fadeToBlack_();
};
