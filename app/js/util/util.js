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

_.startsWith = function(str, prefix) {
  return str.indexOf(prefix) == 0;
};

_.capitalize = function(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

_.uncapitalize = function(str) {
  return str.charAt(0).toLowerCase() + str.slice(1);
};

_.parse = function(context, str) {
  var obj = context;
  _.each(str.split('.'), function(name) {
    obj[name] = _.isDef(obj[name]) ? obj[name] : {};
    obj = obj[name];
  });
  return obj;
};

_.pickFunctions = function(obj, opt_options) {
  var fnMap = {};
  var op = _.defaults(opt_options || {}, {prefix: '', suffix: ''});
  _.each(_.functions(obj), function(fnName) {
    if (_.startsWith(fnName, op.prefix)) {
      var nameLength = fnName.length - op.suffix.length;
      var name = _.uncapitalize(fnName.slice(op.prefix.length, nameLength));
      fnMap[name] = obj[fnName].bind(obj);
    }
  });
  return fnMap;
};

_.key = function(obj) {
  return _.keys(obj)[0];
};

_.value = function(obj) {
  return _.values(obj)[0];
};

_.swap = function(obj, a, b) {
  var temp = obj[a];
  obj[a] = obj[b];
  obj[b] = temp;
};
