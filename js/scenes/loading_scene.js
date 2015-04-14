var LoadingScene = di.service('LoadingScene', [
  'Scene', 'LayoutElement', 'BtnElement', 'EntityElement']);

LoadingScene.prototype.init = function() {
  _.class.extend(this, this.scene_.create('loading'));
};

LoadingScene.prototype.addEntities_ = function() {
  this.element_ = this.entityElement_.create('loadingSplash');
  this.element_.setProp('loading', 0);
};

LoadingScene.prototype.update_ = function(dt) {
  var progress = this.element_.getProp('loading');
  progress += dt * 1.15;
  this.element_.setProp('loading', progress);
  if (progress >= 1) {
    this.transitionInstantly_('intro');
  }
};
