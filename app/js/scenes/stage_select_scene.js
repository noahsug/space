var StageSelectScene = di.service('StageSelectScene', [
  'GameModel as gm', 'Scene', 'LayoutElement', 'StageElement', 'UiElement',
  'LabelElement', 'Inventory', 'Gameplay', 'MissionService']);

StageSelectScene.prototype.init = function() {
  di.extend(this, this.Scene_, 'stageSelect');
};

StageSelectScene.prototype.onStart_ = function() {
  this.openResultScene_ = _.timer();
};

StageSelectScene.prototype.addEntities_ = function() {
  this.layout_ = this.LayoutElement_.new('vertical')
    .setPadding(Padding.MARGIN)

    .add(this.LabelElement_.new()
      .setLayoutFill(true)
      .setLayoutAlign('center')
      .setText(this.gm_.mission.desc, Size.HEADING)
      .setStyle('muted'))

    .addFlex()

    .modify(this.addStages_, this)

    .addFlex();

  if (!this.gm_.mission.tutorial) {
    this.layout_
      .add(this.LayoutElement_.new('horizontal')
        .setLayoutFill(true)
        .add(this.LabelElement_.new()
          .setText('abort', Size.BUTTON)
          .setBg('primary', Padding.BUTTON_BG)
          .onClick(this.abort_, this))

        .addFlex()

        .add(this.LabelElement_.new()
          .setText('fuel: ' + this.gm_.mission.fuel, Size.BUTTON)
          .setStyle('muted')
          .setBg('', Padding.BUTTON_BG)));
  }

  this.fadeFromBlack_();

  if (this.gm_.mission.fuel <= 0) {
    this.gm_.mission.state = 'lost';
    this.layout_.animate('alpha', 0, {delay: Time.TRANSITION_FAST});
    this.layout_.setPauseInput(true);
    this.openResultScene_.start(1);
  }
};

StageSelectScene.prototype.abort_ = function() {
  this.goBackTo_('worldSelect');
};

StageSelectScene.prototype.addStages_ = function(layout) {
  _.each(this.gm_.mission.stages, function(row) {
    var stageRow = this.LayoutElement_.new('horizontal')
      .setLayoutFill(true)
      .setLayoutAlign('center');
    _.each(row, function(stage) {
      stageRow.add(this.createStageBtn_(stage));
    }, this);
    layout.add(stageRow);
  }, this);
};

StageSelectScene.prototype.createStageBtn_ = function(stage) {
  if (stage.empty) {
    return this.UiElement_.new().setPadding(Size.STAGE, Size.STAGE, 0, 0);
  }

  var btn = this.StageElement_.new().setBaselineAlign('middle', 'center')
    .set('stage', stage)
    .setProgress(StageElement.Progress[stage.prevState])
    .animate('progress', StageElement.Progress[stage.state],
             {duration: 1.5});

  if (stage.state == 'unlocked') {
    btn.onClick(function() {
      this.gm_.stage = stage;
      this.transition_('prebattle');
    }, this);
  }

  stage.r = {entity: btn.getEntity()};
  return btn;
};

StageSelectScene.prototype.onTransition_ = function() {
  this.Scene_.onTransition_.call(this);
  this.fadeToBlack_();
};

StageSelectScene.prototype.update_ = function(dt) {
  this.Scene_.update_.call(this, dt);

  if (this.openResultScene_.tick(dt)) {
    this.openModal_('stageResult');
  }
};
