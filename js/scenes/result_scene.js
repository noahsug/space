var ResultScene = di.service('ResultScene', [
  'GameModel as gm', 'Scene', 'LayoutElement', 'BtnElement', 'EntityElement']);

ResultScene.prototype.init = function() {
  _.class.extend(this, this.scene_.create('result'));
};

ResultScene.prototype.addEntities_ = function() {
  this.entityElement_.create('resultSplash');

  var continueBtn = this.btnElement_.create();
  continueBtn.setText('continue', {size: 'btn'});
  continueBtn.onClick(function() {
    this.transition_('main');
  }.bind(this));

  this.layout_ = this.layoutElement_.create({
    direction: 'vertical', align: 'bottom'});
  this.layout_.padding.left = 'btn';
  this.layout_.padding.bottom = 'btn';
  this.layout_.add(continueBtn);
};

ResultScene.prototype.update_ = function(dt, state) {
  this.layout_.update();
};
