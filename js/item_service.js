var ItemService = di.service('ItemService', [
  'Gameplay', 'GameModel as gm']);

ItemService.prototype.get = function() {
  return this.gameplay_.items;
};

ItemService.prototype.getByName = function(name) {
  return this.gameplay_.items[name];
};

ItemService.prototype.getByLevel = function(level) {
  return _.where(this.gameplay_.items, {level: level});
};

ItemService.prototype.getByType = function(type) {
  return _.where(this.gameplay_.items, {category: type});
};

ItemService.prototype.getByTypeAndLevel = function(type, level) {
  return _.where(this.gameplay_.items, {level: level, category: type});
};

ItemService.prototype.getEnemyEquipped = function(type) {
  return _.findWhere(this.gm_.stage.ship, {category: type});
};

ItemService.CD_ONLY = ['tracker', 'pull', 'turret', 'alien spawn',
                       'alien emp', 'pull', 'alien stun', 'refresh',
                       'knockback'];
ItemService.DESC_ONLY = ['divide', 'sticky'];
ItemService.prototype.getDesc = function(item) {
  var descParts = [];
  var descOnly = _.contains(ItemService.DESC_ONLY, item.name);
  var cdOnly = item.category == 'ability' || item.category == 'utility' ||
      _.contains(ItemService.CD_ONLY, item.name);

  if (!descOnly) {
    var cooldown = item.spec.cooldown.toFixed(1);
    descParts.push('Cooldown: ' + cooldown);
  }
  if (!cdOnly) {
    var dmg = item.spec.dmg.toFixed();
    if (item.spec.projectiles > 1) dmg += 'x' + item.spec.projectiles;
    descParts.push('DMG: ' + dmg);

    if (item.spec.seek) {
      var seek = (item.spec.seek * 10).toFixed();
      descParts.push('Seek: ' + seek);
    }
  }

  descParts.push(item.desc);
  return descParts.join('  ');
};
