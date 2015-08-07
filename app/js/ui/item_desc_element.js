var ItemDescElement = di.factory('ItemDescElement', [
  'LayoutElement', 'LabelElement', 'UiElement', 'ItemService']);

ItemDescElement.prototype.init = function() {
  di.extend(this, this.LayoutElement_, 'vertical');

  this.title_ = this.LabelElement_.new()
    .setStyle('muted')
    .setLayoutAlign('center')
    .setText('', Size.DESC_LG);
  this.body_ = this.LabelElement_.new()
    .setTextAlign('center')
    .setLayoutAlign('center')
    .setLineWrap(true)
    .setStyle('muted')
    .setText('', Size.DESC_SM);

  this.add(this.UiElement_.new().setPadding('left', Size.ITEM_DESC_WIDTH));
  this.add(this.title_);
  this.addGap(Padding.DESC_LG);
  this.add(this.body_);

  this.setAlpha(0);
  this.setItem(undefined);
};

ItemDescElement.prototype.setItem = function(item) {
  if (item) {
    this.title_.setText(item.displayName);
    this.body_.setText(this.itemService_.getDesc(item));
  }
  this.animate(
      'alpha', !!item, {duration: Time.TRANSITION_SNAP});
  return this;
};
