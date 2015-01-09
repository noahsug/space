var Select = di.factory('Select', [
  'Entity', 'EntityDecorator', 'GameModel as gm', 'Screen', 'BtnSm']);

Select.prototype.init = function() {
  this.d_ = this.entityDecorator_.getDecorators();
};

Select.prototype.setTitle = function(title) {
  this.title_ = this.entity_.create('label');
  _.decorate(this.title_, this.d_.shape.text,
             {text: title, size: 22, align: 'left'});
  _.decorate(this.title_, this.d_.staticPosition);
  this.gm_.entities.add(this.title_);
};

Select.prototype.setItems = function(items) {
  this.items = new Array(items.length);
  _.each(items, function(name, i) {
    this.items[i] = this.addItem_(name, i);
  }, this);
};

Select.prototype.addItem_ = function(name, i) {
  return this.btnSm_.create(name);
};

Select.prototype.onClick = function(fn) {
  _.each(this.items, function(item, i) {
    item.onClick(_.partial(fn, item, i));
  });
};

Select.prototype.place = function(place, num) {
  this.place_ = place;
  this.num_ = num;
};

Select.prototype.update = function() {
  var bottom = 42;
  var height = 80;
  var gap = (this.screen_.height - bottom - this.num_ * height) /
      (this.num_ + 1);
  var x = -this.screen_.width / 2 + 30;
  var y = -this.screen_.height / 2 + gap + this.place_ * (gap + height);
  this.title_.setPos(x, y);

  for (var i = 0; i < this.items.length; i++) {
    var item = this.items[i];
    item.setPos(x + item.width / 2 + i * (item.width + 15), y + 54);
    item.update();
  }
};
