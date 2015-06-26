var AnimationsFactory = di.factory('AnimationsFactory', []);

// TODO: Make work with ALL ui elements - not just entities.
AnimationsFactory.prototype.init = function(element) {
  this.element_ = element;
  this.animations_ = {};
  this.delayed_ = [];
};

AnimationsFactory.prototype.canAnimate = function(prop) {
  prop = this.parseProp_(prop);
  return _.isFinite(this.getValue_(prop));
};

AnimationsFactory.prototype.animate = function(prop, value, opt_options) {
  prop = this.parseProp_(prop);
  var o = _.options(opt_options, {
    duration: 1,
    delay: 0
  });

  var animation = {
    prop: prop,
    value: value,
    rate: Math.abs(value - this.getValue_(prop)) / o.duration,
    delay: o.delay
  };

  if (o.delay > 0) {
    this.delayed_.push(animation);
  } else {
    this.animations_[prop] = animation;
  }
};

AnimationsFactory.prototype.parseProp_ = function(prop) {
  switch(prop) {
  case 'alpha': return 'entity_.alpha';
  case 'x': return 'offset.x';
  case 'y': return 'offset.y';
  }
  return prop;
};

AnimationsFactory.prototype.getValue_ = function(prop) {
  return _.parse(this.element_, prop);
};

AnimationsFactory.prototype.addValue_ = function(prop, change) {
  var value = this.getValue_(prop);
  _.set(this.element_, prop, value + change);
};

AnimationsFactory.prototype.update = function(dt) {
  this.updateDelayed_(dt);
  this.updateAnimations_(dt);
};

AnimationsFactory.prototype.updateDelayed_ = function(dt) {
  var stillDelayed = [];
  _.each(this.delayed_, function(a) {
    if (this.tick_(a, dt)) {
      this.animations_[a.prop] = a;
    } else {
      stillDelayed.push(a);
    }
  }, this);
  this.delayed_ = stillDelayed;
};

AnimationsFactory.prototype.updateAnimations_ = function(dt) {
  var keys = Object.keys(this.animations_);
  for (var i = 0; i < keys.length; i++) {
    var a = this.animations_[keys[i]];
    var change = this.tick_(a, dt);
    this.addValue_(a.prop, change);
  }
};

AnimationsFactory.prototype.tick_ = function(a, dt) {
  if (a.delay > 0) {
    a.delay -= dt;
    if (a.delay >= 0) return 0;
    dt = -a.delay;
    a.delay = 0;
  }
  var dv = a.value - this.getValue_(a.prop);
  if (Math.abs(dv) < a.rate * dt) {
    delete this.animations_[a.prop];
    return dv;
  }
  return a.rate * dt * Math.sign(dv);
};
