var IntroScene = di.service('IntroScene', [
  'Scene', 'LayoutElement', 'LabelElement']);

IntroScene.prototype.init = function() {
  _.class.extend(this, this.Scene_.new('intro'));
};

IntroScene.prototype.addEntities_ = function() {
  this.layout_ = this.LayoutElement_.new('vertical')
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
      .onClick(function() { this.transition_('missionSelect'); }, this))

      .addFlex(6);
};

IntroScene.prototype.update_ = function(dt) {
  this.layout_.update(dt);
};
