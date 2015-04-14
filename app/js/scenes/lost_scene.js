var LostScene = di.service('LostScene', [
  'Scene', 'LayoutElement', 'BtnElement', 'EntityElement', 'World',
  'Inventory']);

LostScene.prototype.init = function() {
  _.class.extend(this, this.scene_.create('lost'));
};

LostScene.prototype.addEntities_ = function() {
  this.entityElement_.create('lostSplash');

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

LostScene.prototype.start_ = function() {
  _.each(this.gm_.world.aquired, function(item) {
    this.inventory_.remove(item);
  }, this);
  _.each(Game.ITEM_TYPES, function(type) {
    if (!this.inventory_.isEquipped(type)) {
      this.inventory_.equip(this.inventory_.get(type)[0]);
    }
  }, this);
  this.world_.resetProgress();
};

LostScene.prototype.update_ = function(dt, state) {
  this.layout_.update();
};
