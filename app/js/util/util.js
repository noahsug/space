_.radians = function(degrees) {
  return degrees * Math.PI / 180;
};

_.isDef = function(value) {
  return !_.isUndefined(value);
};

_.valueOrFn = function(valueOrFn, var_args) {
  if (typeof valueOrFn == 'function') {
    return valueOrFn.apply(null, _.toArray(arguments).slice(1));
  } else {
    return valueOrFn;
  }
};

_.args = function(args, opt_indexes) {
  var indexes = _.toArray(arguments).slice(1);
  if (indexes.length == 0) {
    indexes = [0];
  }
  var selections = _.initial(indexes);
  var rest = _.last(indexes);
  var output = [];
  selections.forEach(function(i) {
    output.push(args[i]);
  });
  return output.concat(_.toArray(args).slice(rest));
};

var objs = [];
_.slow_uid = function(obj) {
  var uid = _.indexOf(objs, obj);
  if (uid < 0) {
    uid = objs.push(obj);
  }
  return uid;
};

_.fast_uid = function(obj) {
  if (obj.__hash__) {
    return obj.__hash__;
  }
  return obj.__hash__ = _.uniqueId();
};

_.uid = _.fast_uid;

_.pseudorandom = function(seed) {
  var x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

_.pseudorandomSeed = function(opt_seed) {
  if (_.isDef(opt_seed)) {
    return opt_seed + 1;
  }
  return Math.random() * (Math.PI / 2);
};

_.assert = function(truth, msg) {
  if (!truth) {
    throw 'Assert failed: ' + msg;
  }
};

_.angle = function(x1, y1, x2, y2) {
  var dx = x2 - x1;
  var dy = y2 - y1;
  var angle = Math.atan(dy / dx) + Math.PI * 2;
  if (dx < 0) {
    angle += Math.PI;
  }
  return angle;
};
