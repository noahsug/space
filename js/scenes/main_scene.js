var MainScene = di.service('MainScene', [
  'Scene', 'LayoutElement', 'BtnElement', 'EntityElement']);

MainScene.prototype.init = function() {
  _.class.extend(this, this.scene_.create('main'));
};

MainScene.prototype.addEntities_ = function() {
  this.entityElement_.create('mainSplash');
};

MainScene.prototype.addSelects_ = function() {
  this.levelSelect_ = this.select_.create();
  this.levelSelect_.setTitle('SAVE THE WORLD');
  this.levelSelect_.setItems(['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII',
                              'IX', 'X']);
  this.levelSelect_.place(0, 3);
  this.levelSelect_.onClick(function(item) {
    this.startBattle_(item);
  }.bind(this));
  _.invoke(_.rest(this.levelSelect_.items, this.gm_.level + 1), 'markAsLocked');

  this.trainingSelect_ = this.select_.create();
  this.trainingSelect_.setTitle('TRAIN');
  this.trainingSelect_.setItems(['0']);
  this.trainingSelect_.place(1, 3);

  this.equipSelect_ = this.select_.create();
  this.equipSelect_.setTitle('EQUIP');
  this.equipSelect_.setItems(['W', 'S', 'E', 'M']);
  this.equipSelect_.place(2, 3);

  this.selects_ = [
    this.levelSelect_,
    this.trainingSelect_,
    this.equipSelect_
  ];
};

MainScene.prototype.removeEntities_ = function() {
  this.gm_.entities.clear();
};

MainScene.prototype.goBack_ = function(btn) {
  this.transition_(btn);
  this.transitionTo_ = {name: 'intro'};
};

MainScene.prototype.startBattle_ = function(btn) {
  this.transition_(btn);
  this.transitionTo_ = {name: 'battle'};
};

MainScene.prototype.transition_ = function(btn) {
  this.gm_.scenes[this.name] = 'transition';
  this.transitionTime_ = Game.TRANSITION_TIME;
  this.gm_.transition = btn.base;
};

MainScene.prototype.update = function(dt, state) {
  if (state == 'active') {
    for (var i = 0; i < this.selects_.length; i++) {
      this.selects_[i].update(dt);
    }
    this.backBtn_.update(dt);

  } else if (state == 'transition') {
    if ((this.transitionTime_ -= dt) <= 0) {
      this.gm_.transition = null;
      this.removeEntities_();
      this.gm_.scenes[this.name] = 'inactive';
      this.gm_.scenes[this.transitionTo_.name] = 'start';
    }
  }
};
