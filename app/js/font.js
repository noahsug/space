var Font = di.service('Font', ['ctx']);

Font.prototype.width = function(text, size) {
  this.ctx_.font = 'bold ' + size + 'px Arial';
  return this.ctx_.measureText(text).width;
};
