var Label = di.factory('Label', [
  'Font', 'Screen', 'EntityContainer']);

Label.prototype.init = function() {
  _.class.extend(this, this.entityContainer_.create());
};

Label.prototype.setText = function(spec) {
  var entity = this.addEntity('label');
  _.decorate(entity, this.d_.shape.text,
             {text: spec.text, size: spec.size, align: spec.align,
              baseline: spec.baseline});
};

Label.prototype.calcChildWidthHeight_ = function() {
  this.childWidth_ = this.font_.width(this.entity_.text, this.entity_.size);
  this.childHeight_ = this.entity_.size;
};
