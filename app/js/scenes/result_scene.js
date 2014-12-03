var ResultScene = di.service('ResultScene', [
  'GameModel as gm', 'Screen', 'Entity', 'EntityDecorator', 'gameplay']);

ResultScene.prototype.init = function() {
  this.name = 'result';
};

ResultScene.prototype.addEntities = function() {
  var d = this.entityDecorator_.getDecorators();

  if (this.gm_.results.won) {
    var equipBtn = this.entity_.create('btn');
    _.decorate(equipBtn, d.shape.text, {text: 'inventory', size: 20});
    _.decorate(equipBtn, d.clickable);
    _.decorate(equipBtn, d.staticPosition);
    this.gm_.entities.add(equipBtn, 'equipBtn');

    var battleBtn = this.entity_.create('btn');
    _.decorate(battleBtn, d.shape.text, {text: 'continue', size: 20});
    _.decorate(battleBtn, d.clickable);
    _.decorate(battleBtn, d.staticPosition);
    this.gm_.entities.add(battleBtn, 'battleBtn');
  } else {
    var exitBtn = this.entity_.create('btn');
    _.decorate(exitBtn, d.shape.text, {text: 'continue', size: 20});
    _.decorate(exitBtn, d.clickable);
    _.decorate(exitBtn, d.staticPosition);
    this.gm_.entities.add(exitBtn, 'exitBtn');
  }

  var resultsSplash = this.entity_.create('resultsSplash');
  this.gm_.entities.add(resultsSplash, 'resultsSplash');
};

ResultScene.prototype.removeEntities_ = function() {
  this.gm_.entities.clear();
};

ResultScene.prototype.update = function(dt, state) {
  if (this.gm_.results.won) {
    var battleBtn = this.gm_.entities.obj['battleBtn'];
    if (battleBtn.clicked) {
      this.gm_.scenes[this.name] = 'inactive';
      this.removeEntities_();
      this.gm_.level++;
      this.gm_.scenes['battle'] = 'start';
      return;
    }

    var equipBtn = this.gm_.entities.obj['equipBtn'];
    if (equipBtn.clicked) {
      this.gm_.scenes[this.name] = 'inactive';
      this.removeEntities_();
      this.gm_.scenes['equip'] = 'start';
      return;
    }

    var screenBottom = this.screen_.pixelHeight / 2;
    battleBtn.setPos(0, screenBottom - 45 * this.screen_.upscale);
    equipBtn.setPos(0, screenBottom - 90 * this.screen_.upscale);
  } else {
    var exitBtn = this.gm_.entities.obj['exitBtn'];
    if (exitBtn.clicked) {
      this.gm_.scenes[this.name] = 'inactive';
      this.removeEntities_();
      this.gm_.level = 0;
      this.gm_.scenes['intro'] = 'start';
      return;
    }

    var screenBottom = this.screen_.pixelHeight / 2;
    exitBtn.setPos(0, screenBottom - 45 * this.screen_.upscale);
  }
};
