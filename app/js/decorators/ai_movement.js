var AiMovement = di.service('AiMovement', [
  'EntityDecorator', 'Screen']);

AiMovement.prototype.init = function() {
  this.entityDecorator_.addDecorator(
      'movement', 'ai', this.aiMovement_.bind(this));
};

AiMovement.prototype.aiMovement_ = function(obj) {
};
