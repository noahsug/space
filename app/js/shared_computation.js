var SharedComputation = di.service('SharedComputation', [
  'Screen', 'GameModel as gm']);

SharedComputation.prototype.name = 'sharedComputation';

SharedComputation.prototype.decorate = function(obj) {
  obj.c = {};
  obj.act(function() {
    this.wallDis_(obj);
    this.distawnceInfo_(obj);
    this.targetInfo_(obj);
    this.cooldownInfo_(obj);
    this.rangeInfo_(obj);
  }.bind(this));
};

SharedComputation.prototype.cachedCompute_ = function(obj, fnName) {
  obj.c = obj.c || {};
  obj.c.updated = obj.c.updated || {};
  if (obj.c.updated[fnName] != this.gm_.time) {
    obj.c.updated[fnName] = this.gm_.time;
    this[fnName](obj);
  }
};

SharedComputation.prototype.targetInfo_ = function(obj) {
  obj.c.targetDis = _.distance(obj, obj.target);
  obj.c.targetAngle = _.angle(obj, obj.target);
};

SharedComputation.prototype.wallDis = function(obj) {
  this.cachedCompute_(obj, 'wallDis_');
};
SharedComputation.prototype.wallDis_ = function(obj) {
  var dy = obj.y - this.screen_.y;
  var dx = obj.x - this.screen_.x;
  obj.c.wallDisS = this.screen_.height / 2 - dy - obj.collideDis;
  obj.c.wallDisN = this.screen_.height / 2 + dy - obj.collideDis;
  obj.c.wallDisE = this.screen_.width / 2 - dx - obj.collideDis;
  obj.c.wallDisW = this.screen_.width / 2 + dx - obj.collideDis;
  obj.c.wallDisX = Math.min(obj.c.wallDisE, obj.c.wallDisW);
  obj.c.wallDisY = Math.min(obj.c.wallDisN, obj.c.wallDisS);
  obj.c.wallDis = Math.min(obj.c.wallDisX, obj.c.wallDisY);
  obj.c.hitWall = obj.c.wallDis < 0;
};

SharedComputation.prototype.distawnceInfo_ = function(obj) {
  obj.c.centerDis = _.distance(obj, this.screen_);
};

SharedComputation.prototype.cooldownInfo_ = function(obj) {
  // TODO: Keep track of cooldowns hur.
  obj.c.cooldowns = {};

  var t = obj.target;
  var lastFired = Math.max(t.primary.lastFired || -1,
                           t.secondary.lastFired || -1);
  var shouldDodge = this.gm_.time - lastFired < .5;
  if (shouldDodge) {
    if (!obj.c.dodge) {
      obj.c.dodge = _.clone(obj.movement.vector);
    }
  } else {
    obj.c.dodge = false;
  }
};

SharedComputation.prototype.rangeInfo_ = function(obj) {
  // TODO: Account for cooldowns in own ranges.
  var ranges = [];
  if (obj.primary.range) ranges.push(obj.primary.range);
  if (obj.secondary.range) ranges.push(obj.secondary.range);
  if (obj.ability.range) ranges.push(obj.ability.range);
  obj.c.ranges = _.sortBy(ranges).reverse();

  var targetRanges = [];
  if (obj.target.primary.range) targetRanges.push(obj.target.primary.range);
  if (obj.target.secondary.range) targetRanges.push(obj.target.secondary.range);
  if (obj.target.ability.range) targetRanges.push(obj.target.ability.range);
  obj.c.targetRanges = _.sortBy(targetRanges).reverse();
};
