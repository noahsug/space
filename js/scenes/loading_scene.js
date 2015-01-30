var LoadingScene = di.service('LoadingScene', [
  'Scene', 'LayoutElement', 'BtnElement', 'EntityElement']);

LoadingScene.prototype.init = function() {
  _.class.extend(this, this.scene_.create('loading'));
};

LoadingScene.prototype.addEntities_ = function() {
  var loadingElement = this.entityElement_.create('loadingSplash');
  this.entity_ = loadingElement.getEntity();
  this.entity_.loading = 0;
};

LoadingScene.prototype.update_ = function(dt) {
  this.entity_.loading += dt * 1.15;
  if (this.entity_.loading > 1) {
    this.transitionInstantly_('intro');
  }
};
