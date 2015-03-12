var EquipOptionsScene = di.service('EquipOptionsScene', [
  'GameModel as gm', 'Scene', 'LayoutElement', 'BtnElement', 'EntityElement',
  'UiElement', 'Inventory']);

EquipOptionsScene.prototype.init = function() {
  _.class.extend(this, this.scene_.create('equipOptions'));
};

EquipOptionsScene.prototype.addEntities_ = function() {
  this.entityElement_.create('equipOptionsSplash');

  var buttons = [];
  _.each(['primary', 'secondary', 'ability', 'utility', 'mod'], function(type) {
    if (this.inventory_.has(type)) buttons.push(this.createButton_(type));
  }, this);

  var continueBtn = this.btnElement_.create();
  continueBtn.setText('fight', {size: 'btn'});
  continueBtn.onClick(function() {
    this.transition_('battle');
  }.bind(this));
  var backBtn = this.btnElement_.create();
  backBtn.setText('back', {size: 'btn'});
  backBtn.onClick(function() {
    this.transition_('main');
  }.bind(this));

  this.layout_ = this.layoutElement_.create({
    direction: 'vertical', align: 'top'});
  this.layout_.padding.left = 'btn-lg';
  this.layout_.padding.top = 'btn-lg';
  this.layout_.padding.bottom = 'btn-mix';
  _.each(buttons, function(btn) {
    this.layout_.add(btn);
    btn.padding.bottom = 'btn-lg';
  }, this);
  this.layout_.add(this.uiElement_.create(), {flex: 1});
  this.layout_.add(continueBtn);
  continueBtn.layout.align = 'top';
  continueBtn.padding.bottom = 'btn';
  continueBtn.padding.left = 'btn-mix';
  this.layout_.add(backBtn);
  backBtn.layout.align = 'top';
  backBtn.padding.left = 'btn-mix';
};

EquipOptionsScene.prototype.createButton_ = function(type) {
  var btn = this.btnElement_.create();
  btn.setText(Strings.ItemType[type], {size: 'btn-lg'});
  btn.onClick(function() {
    this.goToEquip_(type);
  }.bind(this));
  return btn;
};

EquipOptionsScene.prototype.goToEquip_ = function(type) {
  this.gm_.equipping = type;
  this.transitionFast_('equip');
};

EquipOptionsScene.prototype.update_ = function(dt) {
  this.layout_.update();
};
