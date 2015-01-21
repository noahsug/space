var MainScene = di.service('MainScene', [
  'GameModel as gm', 'Scene', 'LayoutElement', 'BtnElement', 'EntityElement',
  'ShipFactory']);

MainScene.prototype.init = function() {
  _.class.extend(this, this.scene_.create('main'));
};

MainScene.prototype.addEntities_ = function() {
  this.entityElement_.create('mainSplash');

  var battleBtn = this.btnElement_.create();
  battleBtn.setText('fight', {size: 'btn-lg'});
  battleBtn.onClick(function() {
    this.gm_.enemy = {boss: 0};
    this.transition_('battle');
  }.bind(this));

  var equipBtn = this.btnElement_.create();
  equipBtn.setText('customize', {size: 'btn-lg'});
  equipBtn.onClick(function() {
    // TODO: select enemy, etc.
    this.transition_('equipOptions');
  }.bind(this));

  this.layout_ = this.layoutElement_.create({
    direction: 'vertical', align: 'top'});
  this.layout_.padding.left = 'btn-lg';
  this.layout_.padding.top = 'btn-lg';
  this.layout_.add(battleBtn);
  battleBtn.padding.bottom = 'btn-lg';
  this.layout_.add(equipBtn);
};

MainScene.prototype.update_ = function(dt, state) {
  this.layout_.update();
};
