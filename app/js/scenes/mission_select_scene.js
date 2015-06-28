var MissionSelectScene = di.service('MissionSelectScene', [
  'GameModel as gm', 'Scene', 'LayoutElement', 'FadeElement',
  'LabelElement', 'MissionService', 'Inventory']);

MissionSelectScene.prototype.init = function() {
  di.extend(this, this.Scene_, 'missionSelect');
};

MissionSelectScene.prototype.onStart_ = function() {
  this.missionService_.handleMissionResult();
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

  this.fadeFromBlack_();
};

MissionSelectScene.prototype.addMissions_ = function(layout) {
  var unlockedMissions = 0;
  _.each(this.gm_.world.missions, function(mission, i) {
    if (mission.state == 'locked' || mission.state == 'won') return;

    if (unlockedMissions > 0) layout.addGap(Padding.DESC_GAP);

    var missionContainer = this.LayoutElement_.new('vertical')
      .setBgFill(true)
      .setLayoutFill(true)
      .onClick(this.selectMission_.bind(this, mission))
      .setBgStyle('muted')
      .setPadding(Padding.HEADING_SM_BG)

      // Mission desc
      .add(this.LabelElement_.new()
        .setLayoutFill(true)
        .setLineWrap(true)
        .setText(mission.desc, Size.DESC));

    layout.add(missionContainer);
    unlockedMissions++;
  }, this);
};

MissionSelectScene.prototype.selectMission_ = function(mission) {
  this.gm_.mission = mission;
  this.transition_('stageSelect');
  this.fadeToBlack_();
};
