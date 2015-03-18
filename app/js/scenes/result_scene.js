var ResultScene = di.service('ResultScene', [
  'GameModel as gm', 'Scene', 'LayoutElement', 'BtnElement', 'EntityElement',
  'RoundBtnElement', 'ItemService', 'Inventory']);

ResultScene.prototype.init = function() {
  _.class.extend(this, this.scene_.create('result'));
};

var ITEM_PADDING = 20;
ResultScene.prototype.addEntities_ = function() {
  var splash = this.entityElement_.create('resultSplash');

  this.continueBtn_ = this.btnElement_.create();
  this.continueBtn_.setText('continue', {size: 'btn'});
  this.continueBtn_.onClick(function() {
    if (this.continueBtn_.getStyle() == 'locked') return;
    if (this.selectedReward_) this.inventory_.equip(this.selectedReward_);
    this.transition_('main');
  }.bind(this));

  this.layout_ = this.layoutElement_.create({
    direction: 'vertical', align: 'top'});
  this.continueBtn_.layout.align = 'top';

  if (this.gm_.level.state == 'won') {
    var numRewards = this.numRewards_();
    splash.setProp('rewardExists', numRewards);
    if (numRewards > 1) this.continueBtn_.setStyle('locked');
    this.layout_.padding.top = 160 - ITEM_PADDING;

    this.layout_.addFlex();

    var rewardBtns = _.map(Game.ITEM_TYPES, this.createRewardButton_, this);
    var rewardRow1 = this.getRewardRow_(rewardBtns[0], rewardBtns[1]);
    this.layout_.add(rewardRow1);
    rewardRow1.padding.bottom = ITEM_PADDING * 2;
    var rewardRow2 = this.getRewardRow_(rewardBtns[2], rewardBtns[3]);
    this.layout_.add(rewardRow2);

    this.layout_.addFlex();

    this.layout_.add(this.continueBtn_, {align: 'top'});
    this.continueBtn_.padding.left = .66;

    this.layout_.addFlex();

  } else if (this.gm_.level.state == 'lost') {
    this.layout_.addFlex();
    this.layout_.padding.left = 'btn';
    this.layout_.padding.bottom = 'btn';
    this.layout_.add(this.continueBtn_);
    this.continueBtn_.padding.bottom = 'btn';
  } else _.fail('invalid state: ' + this.gm_state);
};

ResultScene.prototype.createRewardButton_ = function(type) {
  var btn = this.roundBtnElement_.create();
  btn.setSize('item');
  btn.setProp('rewardBtn', true);
  var item = this.itemService_.getEnemyEquipped(type) || {};
  btn.setProp('item', item);

  if (item.name && !this.inventory_.isEquipped(item)) {
    if (this.numRewards_() == 1) this.selectReward_(btn);
    btn.onClick(function() {
      this.selectReward_(btn);
    }.bind(this));
  }
  return btn;
};

ResultScene.prototype.selectReward_ = function(btn) {
  if (this.selectedReward_) this.selectedReward_.setStyle('');
  this.selectedReward_ = btn;
  this.selectedReward_.setStyle('active');
  this.continueBtn_.setStyle('');
};

ResultScene.prototype.numRewards_ = function() {
  return Game.ITEM_TYPES.reduce(function(total, type) {
    var item = this.itemService_.getEnemyEquipped(type);
    return total + !!(item && !this.inventory_.isEquipped(item));
  }.bind(this), 0);
};

ResultScene.prototype.getRewardRow_ = function(btn1, btn2) {
  var rewardRow = this.layoutElement_.create();
  rewardRow.childHeight = btn1.entity_.radius * 2;
  rewardRow.add(btn1);
  btn1.padding.right = btn2.padding.right = ITEM_PADDING;
  rewardRow.add(btn2);
  return rewardRow;
};

ResultScene.prototype.update_ = function(dt, state) {
  this.layout_.update();
};
