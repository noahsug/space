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

_.modObj = function(obj, mod) {
  _.each(obj, function(v, k) {
    obj[k] += mod[k] || 0;
  });
  return obj;
};

_.findIndex = function(list, fn) {
  for (var i = 0; i < list.length; i++) {
    if (fn(list[i])) return i;
  }
  return -1;
};

_.findIndexWhere = function(list, attrs) {
  var matches = _.matches(attrs);
  return _.findIndex(list, function(item) {
    return matches(item);
  });
};

_.generateColor = function(r) {
  return '#' + (r.toString(16) + '000000').slice(2, 8);
};

_.generateGray = function(r) {
  var repeating = (r.toString(16) + '00').slice(2, 4);
  return '#' + _.repeat(repeating, 3);
};

_.repeat = function(str, times) {
  return new Array(times + 1).join(str);
};

_.moveTowards = function(source, target, maxDistance) {
  var dx = target.x - source.x;
  var dy = target.y - source.y;
  if (dx == 0 && dy == 0) return true;
  var d = Math.hypot(dx, dy);
  var r = Math.min(d, maxDistance) / d;
  source.x += dx * r;
  source.y += dy * r;
  return d <= maxDistance;
};

_.distance = function(p1, p2) {
  var dx = p2.x - p1.x;
  var dy = p2.y - p1.y;
  return Math.hypot(dx, dy);
};

_.generate = function(generator, length, opt_thisObj) {
  var list = [];
  for (var i = 0; i < length; i++) {
    list.push(generator.call(opt_thisObj, i));
  }
  return list;
};

_.class = {};
_.class.extend = function(destination, source) {
  _.functions(source).forEach(function(fnName) {
    destination[fnName] = source[fnName].bind(source);
  });
  return destination;
};
