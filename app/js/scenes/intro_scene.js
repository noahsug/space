var IntroScene = di.service('IntroScene', [
  'GameModel as gm', 'Screen', 'Entity', 'EntityDecorator',
  'Label', 'Layout']);

IntroScene.prototype.init = function() {
  this.name = 'intro';
};

IntroScene.prototype.addEntities = function() {
  var label = this.label_.create();
  label.setText({text: 'title', size: '20', align: 'center'});
  //label.setPadding(0, 10);

  var label2 = this.label_.create();
  label2.setText({text: '6:', size: '20', align: 'left'});

  var label3 = this.label_.create();
  label3.setText({text: '36', size: '20', align: 'left'});

  this.mainLayout_ = this.layout_.create();
  var layout2 = this.layout_.create();

  layout2.setAlign(Layout.Align.RIGHT);
  layout2.add(label2);
  layout2.add(label3);

  this.mainLayout_.setAlign(Layout.Align.RIGHT);
  this.mainLayout_.add(label);
  this.mainLayout_.add(layout2);
  label.layout.flex = 1;
  layout2.layout.flex = 1;

  //var d = this.entityDecorator_.getDecorators();
  //
  //var splash = this.entity_.create('splash');
  //this.gm_.entities.add(splash, 'splash');
  //
  //var newGameBtn = this.entity_.create('btn');
  //_.decorate(newGameBtn, d.shape.text, {text: 'START', size: function() {
  //  return Math.min(this.screen_.width / 16, this.screen_.height / 8);
  //}.bind(this)});
  //_.decorate(newGameBtn, d.clickable);
  //_.decorate(newGameBtn, d.staticPosition);
  //this.gm_.entities.add(newGameBtn, 'newGameBtn');
};

IntroScene.prototype.removeEntities_ = function() {
  //this.gm_.entities.clear();
};

IntroScene.prototype.update = function(dt, state) {
  //this.label_.update();
  this.mainLayout_.update();

  //var newGameBtn = this.gm_.entities.obj['newGameBtn'];
  //newGameBtn.setPos(0, this.screen_.pixelHeight / 4);
  //
  //if (this.gm_.entities.obj['newGameBtn'].clicked) {
  //  this.gm_.scenes[this.name] = 'inactive';
  //  this.removeEntities_();
  //  this.gm_.scenes['main'] = 'start';
  //}
};
