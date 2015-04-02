var ResultScene = di.service('ResultScene', [
  'GameModel as gm', 'Scene', 'LayoutElement', 'BtnElement', 'EntityElement',
  'RoundBtnElement', 'ItemService', 'Inventory', 'BattleRewards']);

ResultScene.prototype.init = function() {
  _.class.extend(this, this.scene_.create('result'));
};

ResultScene.prototype.start_ = function() {
  this.selectedReward_ = undefined;
};

var ITEM_PADDING = 20;
ResultScene.prototype.addEntities_ = function() {
  var splash = this.entityElement_.create('resultSplash');

  var itemDesc = this.entityElement_.create('itemDesc');
  itemDesc.childHeight = 32;
  itemDesc.getEntity().update(function() {
    if (this.selectedReward_) {
      itemDesc.setProp('item', this.selectedReward_.getProp('item'));
    }
  }.bind(this));

  this.continueBtn_ = this.btnElement_.create();
  this.continueBtn_.setText('continue', {size: 'btn-sm'});
  if (this.gm_.level.state == 'won') this.continueBtn_.setStyle('locked');
  this.continueBtn_.onClick(function() {
    if (this.continueBtn_.getStyle() == 'locked') return;
    if (this.selectedReward_) {
      this.gm_.world.aquired.push(this.selectedReward_.getProp('item'));
    }
    if (this.gm_.level.state == 'lost' && this.gm_.world.lives > 0) {
      this.gm_.level.state = 'unlocked';
      this.gm_.world.lives--;
    }
    if (this.world_.won()) {
      this.transition_('won');
    } else {
      this.transition_('main');
    }
  }.bind(this));

  this.layout_ = this.layoutElement_.create({
    direction: 'vertical', align: 'top'});
  this.continueBtn_.layout.align = 'top';

  if (this.gm_.level.state == 'won') {
    var numRewards = this.battleRewards_.numItems();
    splash.setProp('rewardExists', numRewards);
    this.layout_.padding.top = 120 - ITEM_PADDING;

    this.layout_.addFlex();

    var rewardBtns = _.map(Game.ITEM_TYPES, this.createRewardButton_, this);
    var rewardRow1 = this.getRewardRow_(rewardBtns[0], rewardBtns[1]);
    this.layout_.add(rewardRow1);
    rewardRow1.padding.bottom = ITEM_PADDING * 2;
    var rewardRow2 = this.getRewardRow_(rewardBtns[2], rewardBtns[3]);
    this.layout_.add(rewardRow2);

    this.layout_.addFlex();

    this.layout_.add(itemDesc);

    this.layout_.addFlex();

    this.layout_.add(this.continueBtn_, {align: 'top'});
    this.continueBtn_.padding.left = 'btn-sm';

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
  var item = this.battleRewards_.getReward(type);
  btn.setProp('item', item);

  if (item.name) {
    if (this.battleRewards_.numItems() == 1) this.selectReward_(btn);
    else if (this.gm_.equipping == type) this.selectReward_(btn);
    btn.onClick(function() {
      this.selectReward_(btn);
    }.bind(this));
  }
  return btn;
};

ResultScene.prototype.selectReward_ = function(btn) {
  var item = btn.getProp('item');
  if (this.selectedReward_) {
    if (btn.getStyle() == 'active') {
      this.gm_.equipping = item.category;
      this.transitionFast_('equip');
      return;
    }
    this.selectedReward_.setStyle('');
    this.inventory_.remove(this.selectedReward_.getProp('item'));
  }
  this.selectedReward_ = btn;
  this.selectedReward_.setStyle('active');
  this.inventory_.add(btn.getProp('item'));
  if (!this.inventory_.getEquipped(item.category)) {
    this.inventory_.equip(item);
  }
  this.continueBtn_.setStyle('');
};

ResultScene.prototype.getRewardRow_ = function(btn1, btn2) {
  var rewardRow = this.layoutElement_.create();
  rewardRow.childHeight = btn1.getProp('radius') * 2;
  rewardRow.add(btn1);
  btn1.padding.right = btn2.padding.right = ITEM_PADDING;
  rewardRow.add(btn2);
  return rewardRow;
};

ResultScene.prototype.update_ = function(dt, state) {
  this.layout_.update();
};
