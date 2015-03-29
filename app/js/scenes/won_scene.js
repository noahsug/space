var WonScene = di.service('WonScene', [
  'Scene', 'LayoutElement', 'BtnElement', 'EntityElement']);

WonScene.prototype.init = function() {
  _.class.extend(this, this.scene_.create('won'));
};

WonScene.prototype.addEntities_ = function() {
  this.entityElement_.create('wonSplash');

  var continueBtn = this.btnElement_.create();
  continueBtn.setText('exit', {size: 'btn-sm'});
  continueBtn.onClick(function() {
    this.transition_('intro');
  }.bind(this));

  this.layout_ = this.layoutElement_.create({
    direction: 'vertical', align: 'bottom'});
  this.layout_.padding.left = 'btn';
  this.layout_.padding.bottom = 'btn';
  this.layout_.add(continueBtn);
};

WonScene.prototype.update_ = function(dt, state) {
  this.layout_.update();
};

WonScene.prototype.end_ = function() {
  this.restartGame_();
};
