var GapElement = di.factory('GapElement', ['UiElement']);

GapElement.prototype.init = function(sizeFn, opt_ctx) {
  di.extend(this, this.UiElement_);
  this.sizeFn_ = sizeFn.bind(opt_ctx);
};

GapElement.prototype.calcInnerWidthHeight_ = function() {
  this.innerWidth = this.innerHeight = this.sizeFn_();
};
