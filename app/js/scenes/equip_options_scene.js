var EquipOptionsScene = di.service('EquipOptionsScene', [
  'GameModel as gm', 'Scene', 'LayoutElement', 'BtnElement', 'EntityElement',
  'UiElement', 'RoundBtnElement', 'Inventory']);

EquipOptionsScene.prototype.init = function() {
  _.class.extend(this, this.scene_.create('equipOptions'));
};

var ITEM_PADDING = 20;
EquipOptionsScene.prototype.addEntities_ = function() {
  this.entityElement_.create('equipOptionsSplash');

  var buttons = _.map(['primary', 'secondary', 'ability', 'utility'],
                      this.createEquipButton_.bind(this));

  var continueBtn = this.btnElement_.create();
  continueBtn.setText('fight', {size: 'btn'});
  continueBtn.setStyle('active');
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
  this.layout_.padding.top = 160 - ITEM_PADDING;

  this.layout_.addFlex();

  var equipRow1 = this.getEquipRow_(buttons[0], buttons[1]);
  this.layout_.add(equipRow1);
  equipRow1.padding.bottom = ITEM_PADDING * 2;
  var equipRow2 = this.getEquipRow_(buttons[2], buttons[3]);
  this.layout_.add(equipRow2);

  this.layout_.addFlex();

  var btnRow = this.layoutElement_.create();
  this.layout_.add(btnRow, {align: 'top'});
  btnRow.add(backBtn, {align: 'left'});
  btnRow.childHeight = 20;
  backBtn.setLineDirection('left');
  backBtn.padding.left = 'btn-mix';
  btnRow.addFlex();
  btnRow.add(continueBtn, {align: 'left'});
  continueBtn.padding.right = 'btn-mix';

  this.layout_.addFlex();
};

EquipOptionsScene.prototype.createEquipButton_ = function(type) {
  var btn = this.roundBtnElement_.create();
  btn.setSize('item');
  btn.getEntity().item = this.inventory_.getEquipped(type) || {category: type};
  if (this.inventory_.has(type)) {
    btn.onClick(function() {
      this.goToEquip_(type);
    }.bind(this));
  }
  return btn;
};

EquipOptionsScene.prototype.goToEquip_ = function(type) {
  this.gm_.equipping = type;
  this.transitionFast_('equip');
};

EquipOptionsScene.prototype.getEquipRow_ = function(btn1, btn2) {
  var equipRow = this.layoutElement_.create();
  equipRow.childHeight = btn1.entity_.radius * 2;
  equipRow.add(btn1);
  btn1.padding.right = btn2.padding.right = ITEM_PADDING;
  equipRow.add(btn2);
  return equipRow;
};


EquipOptionsScene.prototype.update_ = function(dt) {
  this.layout_.update();
};
