var IntroScene = di.service('IntroScene', [
  'Scene', 'LayoutElement', 'BtnElement', 'EntityElement']);

IntroScene.prototype.init = function() {
  _.class.extend(this, this.scene_.create('intro'));
};

IntroScene.prototype.addEntities_ = function() {
  this.entityElement_.create('introSplash');

  var newGameBtn = this.btnElement_.create();
  newGameBtn.setText('new game', {size: 'btn'});
  newGameBtn.onClick(function() {
    this.transition_('main');
  }.bind(this));

  var continueBtn = this.btnElement_.create();
  continueBtn.setText('continue', {size: 'btn'});

  this.layout_ = this.layoutElement_.create({
    direction: 'vertical', childrenAlign: 'bottom'});
  this.layout_.padding.left = 'btn';
  this.layout_.padding.bottom = 'btn';
  this.layout_.add(continueBtn);
  continueBtn.layout.align = 'top';
  continueBtn.padding.bottom = 'btn';
  this.layout_.add(newGameBtn);
  newGameBtn.layout.align = 'top';
};

IntroScene.prototype.update_ = function(dt) {
  this.layout_.update();
};
