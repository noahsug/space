var PrebattleScene = di.service('PrebattleScene', [
  'Scene', 'LayoutElement', 'LabelElement', 'ItemElement', 'Inventory',
  'Screen', 'UiElement', 'GameModel as gm', 'SpriteService']);

PrebattleScene.prototype.init = function() {
  di.extend(this, this.Scene_, 'prebattle');
  this.FLY_TIME = 3;
};

PrebattleScene.prototype.onStart_ = function() {
  this.timeToTransition_ = this.FLY_TIME;
  if (this.gm_.mission.index == 0) {
    // Enemy flies in as well.
    this.timeToTransition_ += this.FLY_TIME;
  }
};

PrebattleScene.prototype.addEntities_ = function() {
  this.layout_ = this.LayoutElement_.new('vertical')
    .setChildrenBaselineAlign('middle', 'center')

    // Enemy
    .add(this.ItemElement_.new()
      .setSize(0)
      .setProp('stage', this.gm_.stage)
      .modify(this.maybeFlyIn_, this))

    // Gap
    .addGap(200)

    // Player
    .add(this.ItemElement_.new()
      .setSize(0)
      .setProp('stage', {hull: this.inventory_.getHull()})
      .setOffset(0, this.screen_.height / 2 - 75)
      .animate('y', 0, {duration: this.FLY_TIME}));
};

PrebattleScene.prototype.maybeFlyIn_ = function(enemy) {
  if (this.gm_.mission.index != 0) return;
  enemy
    .setOffset(0, -(this.screen_.height / 2 - 75))
    .animate('y', 0, {delay: this.FLY_TIME, duration: this.FLY_TIME});
};

PrebattleScene.prototype.update_ = function(dt) {
  this.Scene_.update_.call(this, dt);
  if ((this.timeToTransition_ -= dt) <= 0) {
    this.transition_('battle', 0);
  }
};
