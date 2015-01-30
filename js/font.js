var Font = di.service('Font', ['ctx']);

Font.prototype.init = function() {
  this.width = _.memoize(this.widthUnmemoized_.bind(this));
};

Font.prototype.widthUnmemoized_ = function(text, size) {
  this.ctx_.font = size + 'px Arial';
  return this.ctx_.measureText(text).width;
};
