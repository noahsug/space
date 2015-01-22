var MainScene = di.service('MainScene', [
  'GameModel as gm', 'Scene', 'LayoutElement', 'BtnElement', 'EntityElement',
  'ShipFactory']);

MainScene.prototype.init = function() {
  _.class.extend(this, this.scene_.create('main'));
};

MainScene.prototype.addEntities_ = function() {
  this.entityElement_.create('mainSplash');

  var bossBtn = this.btnElement_.create();
  bossBtn.setText('vs ' + Strings.Boss[this.gm_.level], {size: 'btn-lg'});
  bossBtn.onClick(function() {
    this.gm_.enemy = 'boss';
    this.transition_('battle');
  }.bind(this));

  var battleBtn = this.btnElement_.create();
  battleBtn.setText('train', {size: 'btn-lg'});
  battleBtn.onClick(function() {
    this.gm_.enemy = 'random';
    this.transition_('battle');
  }.bind(this));

  var equipBtn = this.btnElement_.create();
  equipBtn.setText('customize', {size: 'btn-lg'});
  equipBtn.onClick(function() {
    // TODO: select enemy, etc.
    this.transition_('equipOptions');
  }.bind(this));

  var btns = [];
  if (this.gm_.daysOnLevel > 1) {
    btns.push(bossBtn);
  }
  if (this.gm_.daysLeft > 0) {
    btns.push(battleBtn);
  }
  if (this.gm_.daysOnLevel > 0) {
    btns.push(equipBtn);
  }

  this.layout_ = this.layoutElement_.create({
    direction: 'vertical', align: 'top'});
  this.layout_.padding.left = 'btn-lg';
  this.layout_.padding.top = .25;
  _.each(btns, function(btn) {
    this.layout_.add(btn);
    btn.padding.bottom = 'btn-lg';
  }, this);
};

MainScene.prototype.update_ = function(dt, state) {
  this.layout_.update();
};
