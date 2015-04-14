var ResultScene = di.service('ResultScene', [
  'GameModel as gm', 'Scene', 'LayoutElement', 'BtnElement', 'EntityElement',
  'RoundBtnElement', 'ItemService', 'Inventory', 'BattleRewards', 'World',
  'LabelElement']);

ResultScene.prototype.init = function() {
  _.class.extend(this, this.scene_.create('result'));
};

ResultScene.prototype.addEntities_ = function() {
  var COLS = 4;  // Number of columns in the item grid.

  this.selectedReward_ = undefined;
  var hasRewards =
      this.gm_.level.state == 'won' && this.battleRewards_.numItems();
  this.continueBtn_ = this.btnElement_.create();
  if (hasRewards && this.battleRewards_.numItems() > 1) {
    this.continueBtn_.setStyle('locked');
  }
  this.layout_ = this.layoutElement_.create({direction: 'vertical'});
  this.layout_.padding.top = -Padding.ITEM + Padding.BOT;

  // Result splash.
  var splashRow = this.layout_.addNew(this.layoutElement_);
  splashRow.layout.align = 'top';
  splashRow.padding.top = Padding.MD;
  var resultSplash = splashRow.addNew(this.entityElement_, 'resultSplash');
  splashRow.addGap(Padding.ITEM * (COLS - 1) + Size.ITEM * COLS);

  this.layout_.addFlex();

  if (hasRewards) {
    // Reward label.
    var rewardRow = this.layout_.addNew(this.layoutElement_);
    rewardRow.layout.align = 'top';
    rewardRow.childHeight = Size.TEXT;
    var rewardLabel = rewardRow.addNew(this.labelElement_);
    var selectText;
    if (this.battleRewards_.items_['augment']) {
      selectText = 'New ' + Strings.ItemType['augment'] + ' found:';
    } else {
      selectText = this.battleRewards_.numItems() > 1 ?
        'Select reward:' : 'New item found:';
    }
    rewardLabel.setText(selectText,
                        {size: Size.TEXT, align: 'left', baseline: 'top'});
    rewardRow.addGap(Padding.ITEM * (COLS - 1) + Size.ITEM * COLS);

    this.layout_.addGap(Padding.MD);

    if (this.battleRewards_.items_['augment']) {
      // Augment reward.
      var augRow = this.layout_.addNew(this.layoutElement_);
      augRow.layout.align = 'top';
      augRow.childHeight = Size.TEXT;
      var augLabel = augRow.addNew(this.labelElement_);
      augLabel.setText('-  ' + this.battleRewards_.items_['augment'].desc,
          {size: Size.TEXT, align: 'left', baseline: 'top'});
      augLabel.padding.left = Padding.ITEM;
      augRow.addGap(Padding.ITEM * (COLS - 1) + Size.ITEM * COLS);

    } else {
      // Rewards.
      var row;
      _.each(Game.ITEM_TYPES, function(type, i) {
        var pos = i % COLS;
        // Gap between rows.
        if (pos == 0 && i) this.layout_.addGap(Padding.ITEM);
        // New row.
        if (pos == 0) {
          row = this.layout_.addNew(this.layoutElement_);
          row.childHeight = Size.ITEM;
        }
        // Gap between btns.
        if (pos) row.addGap(Padding.ITEM);
        // The btn.
        row.add(this.createRewardButton_(type));
      }, this);

      this.layout_.addGap(Padding.ITEM);

      // Item Description.
      var itemDescRow = this.layout_.addNew(this.layoutElement_);
      var itemDesc = itemDescRow.addNew(this.entityElement_, 'itemDesc');
      itemDesc.childHeight = Size.TEXT * 2 + 4;
      itemDesc.getEntity().update(function() {
        if (this.selectedReward_) {
          itemDesc.setProp('item', this.selectedReward_.getProp('item'));
        }
      }.bind(this));
      itemDescRow.addGap(Padding.ITEM * (COLS - 1) + Size.ITEM * COLS);
      itemDescRow.childHeight = itemDesc.childHeight;
    }
  }

  this.layout_.addFlex();

  // Continue button.
  var btnRow = this.layout_.addNew(this.layoutElement_);
  btnRow.setAlign('right');
  btnRow.layout.align = 'top';
  btnRow.childHeight = Size.TEXT + Padding.BOT;
  btnRow.add(this.continueBtn_);
  this.continueBtn_.layout.align = 'left';
  this.continueBtn_.padding.right = Padding.MD;
  this.continueBtn_.setText('continue', {size: Size.TEXT});
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
};

ResultScene.prototype.createRewardButton_ = function(type) {
  var btn = this.roundBtnElement_.create();
  btn.setSize(Size.ITEM);
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
    // Note: Uncomment this to allow equipping items in result screen.
    //if (btn.getStyle() == 'active') {
    //  this.gm_.equipping = item.category;
    //  this.transitionFast_('equip');
    //  return;
    //}
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

ResultScene.prototype.update_ = function(dt, state) {
  this.layout_.update();
};
