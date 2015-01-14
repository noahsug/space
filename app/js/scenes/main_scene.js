var MainScene = di.service('MainScene', [
  'GameModel as gm', 'Scene', 'LayoutElement', 'BtnElement', 'EntityElement',
  'ShipFactory']);

MainScene.prototype.init = function() {
  _.class.extend(this, this.scene_.create('main'));
};

MainScene.prototype.addEntities_ = function() {
  this.entityElement_.create('mainSplash');

  var battleBtn = this.btnElement_.create();
  battleBtn.setText('fight', {size: 20});
  battleBtn.onClick(function(btn) {
    this.gm_.enemy = {boss: 0};
    this.transition_('battle', btn);
  }.bind(this));

  var equipBtn = this.btnElement_.create();
  equipBtn.setText('customize', {size: 20});
  equipBtn.onClick(function(btn) {
    // TODO: select enemy, etc.
    this.transition_('equip', btn);
  }.bind(this));

  this.layout_ = this.layoutElement_.create({
    direction: 'vertical', align: 'top'});
  this.layout_.padding.left = .6;
  this.layout_.padding.top = .2;
  this.layout_.add(battleBtn);
  battleBtn.padding.bottom = 30;
  this.layout_.add(equipBtn);
};

MainScene.prototype.update_ = function(dt, state) {
  this.layout_.update();
};
