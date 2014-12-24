var AiMovement = di.service('AiMovement', [
  'EntityDecorator', 'Screen']);

var NUM_BLOCKS = 3;

AiMovement.prototype.init = function() {
  this.entityDecorator_.addDecorator(
      'movement', 'ai', this.aiMovement_.bind(this));
};

AiMovement.prototype.aiMovement_ = function(e) {
  e.movement = {
    block: 4,
    desiredBlock: 4,
    dx: 0,
    dy: 0,
    desiredDx: 0,
    desiredDy: 0
  };

  e.act(function() {
    e.movement.block = this.getBlock_(e.x, e.y);
    e.movement.desiredBlock =
        this.getDesiredBlock_(e.movement, e.target.movement);
    if (e.movement.block != e.movement.desiredBlock) {
      this.moveTowardsBlock_(e.movement);
    } else {
      this.moveAroundInBlock_(e.movement);
    }
  }.bind(this));
};

AiMovement.prototype.getBlock_ = function(x, y) {
  var blockWidth = this.screen_.width / NUM_BLOCKS;
  var blockHeight = this.screen_.width / NUM_BLOCKS;
  var bx = Math.floor(x / blockWidth);
  var by = Math.floor(y / blockHeight);
  return bx + by * NUM_BLOCKS;
};

AiMovement.prototype.getDesiredBlock_ = function(e, t) {
  return e.block;
};

AiMovement.prototype.moveTowardsBlock_ = function(e) {
  var blockWidth = this.screen_.width / NUM_BLOCKS;
  var blockHeight = this.screen_.width / NUM_BLOCKS;
  var bx = e.block % NUM_BLOCKS;
  var by = Math.floor(e.block / NUM_BLOCKS);
  var desiredX = blockWidth * (bx + .5);
  var desiredY = blockHeight * (bx + .5);
  var disX = e.x - desiredX;
  var disY = e.y - desiredY;
  e.desiredDx = disX / (disX + disY);
  e.desiredDx = disY / (disX + disY);
};

AiMovement.prototype.moveAroundInBlock_ = function(e) {

};
