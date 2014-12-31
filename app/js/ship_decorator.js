var ShipDecorator = di.service('ShipDecorator', [
  'SharedComputation']);

ShipDecorator.prototype.name = 'shipDecorator';

ShipDecorator.prototype.decorate = function(obj) {
  obj.effects = {
    stunned: {},
    weaponsDisabled: {}
  };

  // Items.
  obj.primary = {};
  obj.secondary = {};
  obj.utility = {};
  obj.ability = {};
  obj.movement = {};

  obj.shipCollisionDmg = 10;

  _.decorate(obj, this.sharedComputation_);
};
