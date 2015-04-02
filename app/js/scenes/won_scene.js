var WonScene = di.service('WonScene', [
  'Scene', 'LayoutElement', 'BtnElement', 'EntityElement', 'World']);

WonScene.prototype.init = function() {
  _.class.extend(this, this.scene_.create('won'));
};

WonScene.prototype.addEntities_ = function() {
  this.entityElement_.create('wonSplash');

  var continueBtn = this.btnElement_.create();
  continueBtn.setText('exit', {size: 'btn-sm'});
  continueBtn.onClick(function() {
    this.transition_('worldSelect');
  }.bind(this));

  this.layout_ = this.layoutElement_.create({
    direction: 'vertical', align: 'bottom'});
  this.layout_.padding.left = 'btn-sm';
  this.layout_.padding.bottom = 'btn';
  this.layout_.add(continueBtn);
};

WonScene.prototype.start_ = function() {
  this.world_.resetProgress();
  this.gm_.world.state = 'won';
  if (this.gm_.world.index < this.gm_.worlds.length - 1) {
    this.gm_.worlds[this.gm_.world.index + 1].state = 'unlocked';
  }
};

WonScene.prototype.update_ = function(dt, state) {
  this.layout_.update();
};
