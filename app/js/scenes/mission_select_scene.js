var MissionSelectScene = di.service('MissionSelectScene', [
  'GameModel as gm', 'Scene', 'LayoutElement',
  'LabelElement', 'MissionService', 'Inventory']);

MissionSelectScene.prototype.init = function() {
  _.class.extend(this, this.Scene_.new('missionSelect'));
};

MissionSelectScene.prototype.addEntities_ = function() {
  this.layout_ = this.LayoutElement_.new('vertical')
    .setPadding(Padding.MARGIN)
    .setChildrenBaseline('middle')
    .add(this.LayoutElement_.new('horizontal')
      .add(this.LabelElement_.new()
        .setText('missions', Size.HEADING_SM)
        .setStyle('muted')
        .setBg('muted', Padding.HEADING_SM_BG)
        .setLayoutAlign('left')))

    .addGap(Padding.DESC_GAP)

    .modify(this.addMissions_, this);
};

MissionSelectScene.prototype.addMissions_ = function(layout) {
  _.each(this.gm_.world.missions, function(mission, i) {
    if (i) layout.addGap(Padding.DESC_GAP);

    layout.add(this.LayoutElement_.new('vertical')
      .setBgFill(true)
      .setLayoutFill(true)
      .onClick(this.selectMission_.bind(this, mission))
      .setStyle('muted')
      .setBorderStyle('muted')
      .setPadding(Padding.HEADING_SM_BG)
      // Mission title
      .add(this.LabelElement_.new()
        .setText(mission.title, Size.DESC_LG)
        .setBaselineAlign('top', 'left')
        .setLayoutAlign('left'))

      .addGap(Padding.DESC_LG)

      // Mission desc
      .add(this.LayoutElement_.new('horizontal')
        .add(this.LabelElement_.new()
          .setLineWrap(true)
          .setText(mission.desc, Size.DESC)
          .setBaselineAlign('top', 'left')
          .setLayoutAlign('left'))));
  }, this);
};

MissionSelectScene.prototype.selectMission_ = function(mission) {
  this.gm_.mission = mission;
  this.transition_('stageSelect');
};
