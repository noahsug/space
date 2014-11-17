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
  this.gm_.entities['splash'] = splash;

  var newGameBtn = this.entity_.create('btn');
  _.decorate(newGameBtn, d.shape.text, {text: 'START', size: function() {
    return Math.min(this.screen_.width / 16, this.screen_.height / 8);
  }.bind(this)});
  _.decorate(newGameBtn, d.clickable);
  this.gm_.entities['newGameBtn'] = newGameBtn;
};

IntroScene.prototype.removeEntities_ = function() {
  delete this.gm_.entities['splash'];
  delete this.gm_.entities['newGameBtn'];
};

IntroScene.prototype.update = function(dt) {
  if (this.gm_.scenes['intro'] != 'active') return;

  this.gm_.entities['newGameBtn'].y = this.screen_.height / 4;
  if (this.gm_.entities['newGameBtn'].clicked) {
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
