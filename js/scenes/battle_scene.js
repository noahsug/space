var BattleScene = di.service('BattleScene', [
  'GameModel as gm', 'Screen', 'Entity', 'EntityDecorator', 'gameplay',
  'ShipDecorator']);

var TRANSITION_TIME = 2;

BattleScene.prototype.init = function() {
  this.name = 'battle';
};

BattleScene.prototype.addEntities = function() {
  var ed = this.entityDecorator_;

  var player = this.entity_.create('ship');
  _.decorate(player, this.shipDecorator_);
  ed.decorate(player, this.gm_.player.spec);
  player.style = 'good';
  this.gm_.entities.add(player, 'player');

  var enemy = this.entity_.create('ship');
  _.decorate(enemy, this.shipDecorator_);
  var enemySpec = this.gameplay_.level[this.gm_.level].enemy;
  ed.decorate(enemy, enemySpec);
  enemy.style = 'bad';
  this.gm_.entities.add(enemy, 'enemy');

  player.y = this.screen_.y + 100;
  player.x = this.screen_.x;
  enemy.y = this.screen_.y - 100;
  enemy.x = this.screen_.x;

  player.target = enemy;
  enemy.target = player;
};

BattleScene.prototype.removeEntities_ = function() {
  this.gm_.entities.clear();
};

BattleScene.prototype.update = function(dt, state) {
  if (state == 'active') {
    var player = this.gm_.entities.obj['player'];
    var enemy = this.gm_.entities.obj['enemy'];
    if (player.dead || enemy.dead) {
      if (!player.dead) {
        this.gm_.results.won = true;
        this.rewardPlayer_();
      }
      this.gm_.scenes[this.name] = 'transition';
      this.transitionTime_ = TRANSITION_TIME;
    }
  } else if (state == 'transition') {
    this.transitionTime_ -= dt / this.gm_.speed;
    if (this.transitionTime_ <= 0) {
      this.gm_.scenes[this.name] = 'transitionOver';
    }
    this.gm_.speed =
        Math.max(.01, .25 * this.transitionTime_ / TRANSITION_TIME);
  } else if (state == 'transitionOver') {
    this.gm_.speed = 1;
    this.gm_.scenes[this.name] = 'inactive';
    this.removeEntities_();
    this.gm_.scenes['result'] = 'start';
  }
};

BattleScene.prototype.rewardPlayer_ = function() {
  var level = this.gm_.level;
  if (Math.random() < .25 && level) level--;
  if (Math.random() < .25 && level) level--;
  this.gm_.results.earned = this.getRandomItem_(level);
  this.gm_.player.inventory.push(this.gm_.results.earned);
};

BattleScene.prototype.getRandomItem_ = function(level) {
  return _.sample(_.where(this.gameplay_.items, {level: level}));
};