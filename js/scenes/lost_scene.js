var LostScene = di.service('LostScene', [
  'Scene', 'LayoutElement', 'BtnElement', 'EntityElement']);

LostScene.prototype.init = function() {
  _.class.extend(this, this.scene_.create('lost'));
};

LostScene.prototype.addEntities_ = function() {
  this.entityElement_.create('lostSplash');

  var continueBtn = this.btnElement_.create();
  continueBtn.setText('continue', {size: 'btn'});
  continueBtn.onClick(function() {
    this.transition_('intro');
  }.bind(this));

  this.layout_ = this.layoutElement_.create({
    direction: 'vertical', align: 'bottom'});
  this.layout_.padding.left = 'btn';
  this.layout_.padding.bottom = 'btn';
  this.layout_.add(continueBtn);
};

LostScene.prototype.update_ = function(dt, state) {
  this.layout_.update();
};

LostScene.prototype.transitionOver_ = function() {
  this.restartGame_();
};
