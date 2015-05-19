var WonScene = di.service('WonScene', [
  'Scene', 'LayoutElement', 'BtnElement', 'EntityElement', 'MissionService']);

WonScene.prototype.init = function() {
  _.class.extend(this, this.scene_.create('won'));
};

WonScene.prototype.addEntities_ = function() {
  this.entityElement_.create('wonSplash');

  var continueBtn = this.btnElement_.create();
  continueBtn.setText('exit', {size: 'btn-sm'});
  continueBtn.onClick(function() {
    this.transition_('missionSelect');
  }.bind(this));

  this.layout_ = this.layoutElement_.create({
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
