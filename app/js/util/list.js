var List = function(opt_length) {
  this.arr = new Array(opt_length || 10);
  this.length = 0;
};

List.prototype.clear = function() {
  this.length = 0;
};

window.List = List;
