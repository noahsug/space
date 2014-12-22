/**
 * Get an element -> list.arr[4]
 * Get list length -> list.length
 * Add an element -> list.arr[list.length++] = 'ele'
 * Add a tagged element (warning: slow) -> list.add(player, 'player')
 */
var List = function(opt_length) {
  this.arr = new Array(opt_length || 10);
  this.clear();
};

List.prototype.clear = function() {
  this.length = 0;
  this.obj = {};
};

List.prototype.add = function(entity, opt_name) {
  this.arr[this.length++] = entity;
  if (opt_name) this.obj[opt_name] = entity;
};

List.prototype.remove = function(i) {
  this.arr[i] = this.arr[this.length - 1];
  this.length--;
};

window.List = List;
