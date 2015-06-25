var TutorialScene = di.service('TutorialScene', [
  'Scene', 'LayoutElement', 'LabelElement', 'ItemElement', 'Inventory',
  'Screen', 'UiElement', 'GameModel as gm']);

TutorialScene.prototype.init = function() {
  di.extend(this, this.Scene_, 'tutorial');
};

TutorialScene.prototype.onStart_ = function() {
  // Select the tutorial mission and stage.
  this.gm_.mission = this.gm_.world.missions[0];
  this.gm_.stage = this.gm_.mission.stages[0][0];
};

TutorialScene.prototype.addEntities_ = function() {
  // Mission
  this.layout_ = this.LayoutElement_.new('vertical')
    .setPadding(Padding.MARGIN)
    .setPadding('top', Padding.MARGIN * 3)

    .add(this.LayoutElement_.new('vertical')
      .setBgFill(true)
      .setLayoutFill(true)
      .setBgStyle('primary')
      .setPadding(Padding.HEADING_SM_BG)
      .add(this.LabelElement_.new()
        .setLineWrap(true)
        .setText(this.gm_.mission.desc, Size.DESC))
      .setAlpha(0)
      .animate('alpha', 1, {delay: 2.25}));

  this.playerLayout_ = this.LayoutElement_.new('vertical')
    .setChildrenBaseline('middle')

    // Gap
    .add(this.UiElement_.new()
      .setPadding('top', this.screen_.height + Size.STAGE)
      .animate('padding.top', 200 + Size.STAGE,
               {duration: 2, delay: .25}))

    // Player
    .add(this.ItemElement_.new()
      .setLayoutAlign('center')
      .setSize(Size.STAGE)
      .setProp('stage', {hull: this.inventory_.getHull()}));
};

TutorialScene.prototype.update_ = function(dt) {
  this.playerLayout_.update(dt);
  this.layout_.update(dt);
};
