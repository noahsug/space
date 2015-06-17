var WonScene = di.service('WonScene', [
  'Scene', 'LayoutElement', 'LabelElement', 'EntityElement', 'MissionService']);

WonScene.prototype.init = function() {
  _.class.extend(this, this.Scene_.new('won'));
};

WonScene.prototype.addEntities_ = function() {
  this.EntityElement_.new('wonSplash');

  var continueBtn = this.LabelElement_.new();
  continueBtn.setText('exit', Size.BUTTON);
  continueBtn.onClick(function() {
    this.transition_('missionSelect');
  }.bind(this));

  this.layout_ = this.LayoutElement_.new({
    direction: 'vertical', align: 'bottom'});
  this.layout_.padding.left = 'btn-sm';
  this.layout_.padding.bottom = 'btn';
  this.layout_.add(continueBtn);
};

WonScene.prototype.start_ = function() {
  this.missionService_.resetProgress();
  this.gm_.mission.state = 'won';
  if (this.gm_.mission.index < this.gm_.world.missions.length - 1) {
    this.gm_.world.missions[this.gm_.mission.index + 1].state = 'unlocked';
  }
};

WonScene.prototype.update_ = function(dt, state) {
  this.layout_.update();
};
