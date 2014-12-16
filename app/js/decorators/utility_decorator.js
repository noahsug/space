var UtilityDecorators = di.service('UtilityDecorators', [
  'EntityDecorator', 'Random']);

UtilityDecorators.prototype.init = function() {
  this.entityDecorator_.addDecoratorObj(this, 'utility');
};

UtilityDecorators.prototype.decorateTeleport_ = function(obj, spec) {
  spec = _.options(spec, {
    cooldown: 0,
    distance: 50
  });

  obj.teleport = {
    ready: false,
    use: false
  };

  var cooldown = spec.cooldown;
  obj.act(function(dt) {
    cooldown -= dt;
    obj.teleport.ready = cooldown <= 0;
  });

  obj.resolve(function() {
    if (obj.teleport.use) {
      teleport();
      obj.teleport.ready = false;
      obj.teleport.use = false;
      cooldown = spec.cooldown;
    }
  });

  var teleport = function() {
    obj.x += spec.distance * (this.random_.flipCoin() ? 1 : -1);
    obj.y += spec.distance * (this.random_.flipCoin() ? 1 : -1);
  }.bind(this);
};
