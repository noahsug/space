var PowerDecorators = di.service('PowerDecorators', [
  'EntityDecorator', 'Random']);

PowerDecorators.prototype.init = function() {
  this.entityDecorator_.addDecoratorObj(this, 'power');
};

PowerDecorators.prototype.decorateTeleport_ = function(obj, spec) {
  var DISTANCE = 100;
  _.defaults(spec, {
    cooldown: 2
  });

  obj.teleport = {
    ready: false,
    use: false
  };

  var cooldown = spec.cooldown;
  obj.act(function(dt) {
    if (obj.teleport.use) {
      teleport();
      obj.teleport.ready = false;
      obj.teleport.use = false;
      cooldown = spec.cooldown;
    } else {
      cooldown -= dt;
      obj.teleport.ready = cooldown <= 0;
    }
  }.bind(this));

  var teleport = function() {
    obj.x += DISTANCE * this.random_.next() - DISTANCE / 2;
    obj.y += DISTANCE * this.random_.next() - DISTANCE / 2;
  }.bind(this);
};
