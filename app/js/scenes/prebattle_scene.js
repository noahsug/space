var PrebattleScene = di.service('PrebattleScene', [
  'Scene', 'LayoutElement', 'LabelElement', 'ItemElement', 'Inventory',
  'Screen', 'UiElement', 'GameModel as gm', 'SpriteService']);

PrebattleScene.prototype.init = function() {
  di.extend(this, this.Scene_, 'prebattle');
  this.FLY_TIME = 3;
};

PrebattleScene.prototype.onStart_ = function() {
  this.timeToTransition_ = this.FLY_TIME * 2;
};

PrebattleScene.prototype.addEntities_ = function() {
  this.layout_ = this.LayoutElement_.new('vertical')
    .setChildrenBaselineAlign('middle', 'center')

    // Enemy
    .add(this.ItemElement_.new()
      .setSize(0)
      .setProp('stage', this.gm_.stage)
      .setOffset(0, -(this.screen_.height / 2 - 75))
      .animate('y', 0, {delay: this.FLY_TIME, duration: this.FLY_TIME}))

    // Gap
    .addGap(200)

    // Player
    .add(this.ItemElement_.new()
      .setSize(0)
      .setProp('stage', {hull: this.inventory_.getHull()})
      .setOffset(0, this.screen_.height / 2 - 75)
      .animate('y', 0, {duration: this.FLY_TIME}));
};

PrebattleScene.prototype.update_ = function(dt) {
  this.base_.update_.call(this, dt);
  if ((this.timeToTransition_ -= dt) <= 0) {
    this.transition_('battle', 0);
  }
};
