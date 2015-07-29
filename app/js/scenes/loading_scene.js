var LoadingScene = di.service('LoadingScene', [
  'Scene', 'LayoutElement', 'LabelElement', 'EntityElement']);

LoadingScene.prototype.init = function() {
  di.extend(this, this.Scene_, 'loading');
};

LoadingScene.prototype.addEntities_ = function() {
  this.element_ = this.EntityElement_.new('loadingSplash');
  this.element_.set('loading', 0);
};

LoadingScene.prototype.update_ = function(dt) {
  var progress = this.element_.get('loading');
  progress += dt * 1.5;
  this.element_.set('loading', progress);
  if (progress >= 1.5) {
    this.transition_('intro', {time: 0});
  }
};
