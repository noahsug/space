var IntroScene = di.service('IntroScene', [
  'GameModel as gm', 'Screen', 'Entity', 'EntityDecorator']);

IntroScene.prototype.init = function() {
  this.gm_.scenes['intro'] = 'inactive';
};

IntroScene.prototype.start = function() {
  this.gm_.scenes['intro'] = 'active';
  this.addEntities_();
};

IntroScene.prototype.addEntities_ = function() {
  var d = this.entityDecorator_.getDecorators();

  var splash = this.entity_.create('splash');
  this.gm_.entities.add(splash, 'splash');

  var newGameBtn = this.entity_.create('btn');
  _.decorate(newGameBtn, d.shape.text, {text: 'START', size: function() {
    return Math.min(this.screen_.width / 16, this.screen_.height / 8);
  }.bind(this)});
  _.decorate(newGameBtn, d.clickable);
  _.decorate(newGameBtn, d.staticPosition);
  this.gm_.entities.add(newGameBtn, 'newGameBtn');
};

IntroScene.prototype.removeEntities_ = function() {
  this.gm_.entities.clear();
};

IntroScene.prototype.update = function(dt) {
  if (this.gm_.scenes['intro'] != 'active') return;

  var newGameBtn = this.gm_.entities.obj['newGameBtn'];
  newGameBtn.setPos(0, this.screen_.pixelHeight / 4);

  if (this.gm_.entities.obj['newGameBtn'].clicked) {
    this.gm_.scenes['intro'] = 'inactive';
    this.removeEntities_();
    this.gm_.scenes['battle'] = 'start';
  }
};

IntroScene.prototype.resolve = function(dt) {
  if (this.gm_.scenes['intro'] == 'start') {
    this.start();
    this.update(dt);
  }
};
