var MissionResultScene = di.service('MissionResultScene', [
  'GameModel as gm', 'Scene', 'LayoutElement', 'BackdropElement',
  'RoundBtnElement', 'ItemService', 'BattleRewards', 'MissionService',
  'LabelElement', 'ItemElement']);

MissionResultScene.prototype.init = function() {
  _.class.extend(this, this.Scene_.new('missionResult'));
};

MissionResultScene.prototype.onStart_ = function() {
  this.reward_ = this.battleRewards_.rewardPlayer();
  this.addEntities_();
};

MissionResultScene.prototype.addEntities_ = function() {
  this.layout_ = this.LayoutElement_.new('vertical')
    .add(this.BackdropElement_.new())
    .setChildrenBaselineAlign('middle', 'center')
    .add(this.LayoutElement_.new('vertical')
      .setPadding(Padding.MODAL_MARGIN)
      .setPadding('bottom', Padding.MODAL_MARGIN - Padding.BUTTON_BG)
      .setBgStyle('muted')
      .setBorderStyle('primary')

      .add(this.LabelElement_.new()
        .setText(this.gm_.mission.state == 'won' ?
                 'mission complete' : 'mission failed', 22)
        .setStyle('muted')
        .setPadding('bottom', Padding.MARGIN))

      .modify(this.maybeAddReward_, this)

      .add(this.LabelElement_.new()
        .setText('continue', Size.BUTTON)
        .setBg('primary', Padding.BUTTON_BG)
        .setLayoutAlign('center')
        .onClick(this.goBackTo_.bind(this, 'missionSelect'))));
};

MissionResultScene.prototype.maybeAddReward_ = function(layout) {
  if (!this.reward_) return;
  layout.add(this.LayoutElement_.new('vertical')

    // New item.
    .add(this.LayoutElement_.new('horizontal')
      .setPadding('bottom', Padding.MARGIN_SM)
      .add(this.LabelElement_.new()
        .setPadding('top', Size.ITEM / 2)
        .setPadding('right', 5)
        .setBaseline('middle')
        .setStyle('muted')
        .setText('new ' + Strings.ItemType[this.reward_.category] + ':',
                 Size.DESC_LG))
      .add(this.ItemElement_.new()
        .setProp('item', this.reward_)
        .setSize(Size.ITEM)))

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
         .setBg('none', Padding.DESC_SM_BG))

    .addGap(Padding.MARGIN_SM));
};
