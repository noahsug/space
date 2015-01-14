var IntroScene = di.service('IntroScene', [
  'Scene', 'LayoutElement', 'BtnElement', 'EntityElement']);

IntroScene.prototype.init = function() {
  _.class.extend(this, this.scene_.create('intro'));
};

IntroScene.prototype.addEntities_ = function() {
  this.entityElement_.create('introSplash');

  var newGameBtn = this.btnElement_.create();
  newGameBtn.setText('new game', {size: 16});
  newGameBtn.onClick(function(btn) {
    this.transition_(btn, 'main');
  }.bind(this));

  var continueBtn = this.btnElement_.create();
  continueBtn.setText('continue', {size: 16});

  this.layout_ = this.layoutElement_.create({direction: 'vertical'});
  this.layout_.padding.left = .65;
  this.layout_.padding.top = .3;
  this.layout_.add(continueBtn);
  continueBtn.padding.bottom = 25;
  this.layout_.add(newGameBtn);
};

IntroScene.prototype.update_ = function(dt) {
  this.layout_.update();
};
