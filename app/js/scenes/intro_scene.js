var IntroScene = di.service('IntroScene', [
  'Scene', 'LayoutElement', 'LabelElement']);

IntroScene.prototype.init = function() {
  di.extend(this, this.Scene_, 'intro');
};

IntroScene.prototype.addEntities_ = function() {
  this.layout_ = this.LayoutElement_.new('vertical')
    .setChildrenFill(true)
    .setChildrenAlign('center')

    .addFlex(8)

    .add(this.LabelElement_.new()
      .setAlpha(0)
      .animate('alpha', 1, {duration: 1.5})
      .setText('COSMAL', Size.TITLE))

    .addFlex(3)

    .add(this.LabelElement_.new()
      .setAlpha(0)
      .animate('alpha', 1, {duration: 1, delay: 1})
      .setText('new game', Size.BUTTON_LG)
      .setBg('primary', Padding.BUTTON_LG_BG)
      .onClick(this.transition_.bind(
          this, 'prebattle', {time: Time.TRANSITION_SLOW})))

    .addFlex(6);
};

IntroScene.prototype.onTransition_ = function() {
  this.Scene_.onTransition_.call(this);
  this.fadeOut_();
};
