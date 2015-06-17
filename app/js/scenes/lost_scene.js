var LostScene = di.service('LostScene', [
  'Scene', 'LayoutElement', 'LabelElement', 'EntityElement', 'MissionService',
  'Inventory']);

LostScene.prototype.init = function() {
  _.class.extend(this, this.Scene_.new('lost'));
};

LostScene.prototype.addEntities_ = function() {
  this.EntityElement_.new('lostSplash');

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

LostScene.prototype.start_ = function() {
  this.missionService_.resetProgress();
};

LostScene.prototype.update_ = function(dt, state) {
  this.layout_.update();
};
