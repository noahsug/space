var AnimationsFactory = di.factory('AnimationsFactory', []);

// TODO: Make work with ALL ui elements - not just entities.
AnimationsFactory.prototype.init = function(entity) {
  this.entity_ = entity;
  this.animations_ = {};
};

AnimationsFactory.prototype.animate = function(prop, value, opt_options) {
  var o = _.options(opt_options, {
    duration: 1,
    delay: 0
  });
  this.animations_[prop] = {
    prop: prop,
    value: value,
    rate: Math.abs(value - this.entity_[prop]) / o.duration,
    delay: o.delay
  };
};

AnimationsFactory.prototype.update = function(dt) {
  var keys = Object.keys(this.animations_);
  for (var i = 0; i < keys.length; i++) {
    var a = this.animations_[keys[i]];
    var change = this.tick_(a, dt);
    this.entity_[a.prop] += change;
  }
};

AnimationsFactory.prototype.tick_ = function(a, dt) {
  if (a.delay > 0) {
    a.delay -= dt;
    if (a.delay >= 0) return 0;
    dt = -a.delay;
    a.delay = 0;
  }
  var dv = a.value - this.entity_[a.prop];
  if (Math.abs(dv) < a.rate * dt) {
    delete this.animations_[a.prop];
    return dv;
  }
  return a.rate * dt * Math.sign(dv);
};
