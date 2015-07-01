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
    .modify(this.addEvents_, this);

  this.fadeFromBlack_();
};

MissionSelectScene.prototype.addEvents_ = function(layout) {
  var firstEvent = false;
  _.each(this.gm_.world.events, function(event, i) {
    if (event.state == 'locked' || event.state == 'won') return;

    _.each(event.text, function(text) {
      if (firstEvent) layout.addGap(Padding.MARGIN);
      firstEvent = true;

      layout
        .add(this.LayoutElement_.new('vertical')
          .setBgFill(true)
          .setLayoutFill(true)
          .setBgStyle('muted')
          .setPadding(Padding.HEADING_SM_BG)

          // Event desc
          .add(this.LabelElement_.new()
            .setLayoutFill(true)
            .setLineWrap(true)
            .setText(text, Size.DESC_LG)));
    }, this);

    layout.modify(this.addMissions_.bind(this, event));
  }, this);
};

MissionSelectScene.prototype.addMissions_ = function(event, layout) {
  _.each(event.missions, function(mission) {
    layout.addGap(Padding.MARGIN);

    layout.add(this.LabelElement_.new()
      .setText(mission.text, Size.BUTTON_SM)
      .setBg('primary', Padding.BUTTON_SM_BG)
      .onClick(this.selectMission_.bind(this, mission, event)));
  }, this);
};

MissionSelectScene.prototype.selectMission_ = function(mission, event) {
  this.gm_.mission = mission;
  this.gm_.event = event;
  if (mission.stages.length) {
    this.transition_('stageSelect');
  } else {
    event.state = 'won';
    this.transition_('missionSelect');
  }
  this.fadeToBlack_();
};
