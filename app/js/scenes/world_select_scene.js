var WorldSelectScene = di.service('WorldSelectScene', [
  'GameModel as gm', 'Scene', 'LayoutElement', 'LabelElement', 'SpriteService',
  'EntityElement', 'MissionService']);

WorldSelectScene.prototype.init = function() {
  di.extend(this, this.Scene_, 'worldSelect');
};

WorldSelectScene.prototype.addEntities_ = function() {
  this.layout_ = this.LayoutElement_.new('vertical')
    .setChildrenBaselineAlign('middle', 'center')
    .setChildrenFill(true)
    .modify(this.addWorlds_, this);

  this.fadeFromBlack_();
};

WorldSelectScene.prototype.addWorlds_ = function(layout) {
  _.each(this.gm_.worlds, function(world, i) {
    if (i) layout.addGap(Padding.MARGIN_LG);
    var row = this.LayoutElement_.new('horizontal');
    if (world.state == 'unlocked') {
      row.onClick(function() {
        this.missionService_.selectWorld(world);
        this.transition_('stageSelect');
      }, this);
    }
    layout.add(row);

    row.add(this.EntityElement_.new('world')
      .setSize(Size.WORLD)
      .setBaselineAlign('middle', 'center')
      .set('world', world));

    row.addGap(18);

    var label = this.LayoutElement_.new('vertical')
      .setChildrenBaseline('middle')
      .setChildrenFill(true);
    row.add(label);

    if (world.state == 'locked') {
      label.add(this.LabelElement_.new()
        .setText('locked', Size.DESC_LG * 1.5)
        .setStyle('dark'));
    } else {
      var percentComplete = this.missionService_.getPercentComplete(world);
      label
        .add(this.LabelElement_.new()
          .setStyle('muted')
          .setText(world.displayName, Size.DESC_LG * 1.5))
        .addGap(Size.DESC_LG)
        .add(this.LabelElement_.new()
          .setStyle('muted')
          .setText('progress: ' + percentComplete + '%', Size.DESC_LG));
    }
  }, this);
};

WorldSelectScene.prototype.onTransition_ = function() {
  this.Scene_.onTransition_.call(this);
  this.fadeToBlack_();
};
