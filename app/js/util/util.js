_.EMPTY_FN = function() {};

_.pos = {
  BOTTOM: 'bottom'
};

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

// Warning: Very slow.
_.args = function(args, opt_indexes) {
  if (arguments.length == 1) {
    return _.toArray(args);
  }
  var indexes = _.toArray(arguments).slice(1);
  var selections = _.initial(indexes);
  var rest = _.last(indexes);
  var output = new Array(selections.length);
  selections.forEach(function(i) {
    output[i] = args[i];
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

_.quadratic = function(a, b, c) {
  var inner = Math.sqrt(b * b - 4 * a * c);
  return Math.max((-b + inner) / (2 * a), (-b - inner) / (2 * a));
};

_.angle = function(p1, p2) {
  if (!p2) {
    p2 = p1;
    p1 = {x: 0, y: 0};
  }
  var dx = p2.x - p1.x;
  var dy = p2.y - p1.y;
  var angle = Math.atan(dy / dx);
  if (dx < 0) {
    angle += Math.PI;
  }
  if (angle < 0) {
    angle += Math.PI * 2;
  }
  return angle;
};

// Given the angles of two vectors in a triangle, returns the difference.
_.angleDif = function(a1, a2) {
  var da = a1 - a2;
  if (da < 0) da += Math.PI * 2;
  if (da > Math.PI) da = Math.PI * 2 - da;
  return da;
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

_.set = function(context, str, value) {
  var obj = context;
  var split = str.split('.');
  for (var i = 0; i < split.length - 1; i++) {
    var name = split[i];
    obj[name] = _.isDef(obj[name]) ? obj[name] : {};
    obj = obj[name];
  }
  var key = _.last(split);
  obj[key] = value;
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

_.splitOnCaps = function(str) {
  return str.split(/(?=[A-Z])/);
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

_.ORIGIN = {x: 0, y: 0};

_.distance = function(p1, p2) {
  if (!p2) {
    p2 = _.ORIGIN;
  }
  var dx = p2.x - p1.x;
  var dy = p2.y - p1.y;
  return Math.hypot(dx, dy);
};

_.generate = function(generator, length, opt_thisObj) {
  var list = new Array(length);
  for (var i = 0; i < length; i++) {
    list[i] = generator.call(opt_thisObj, i);
  }
  return list;
};

_.min = function(list) {
  var min;
  for (var i = 0; i < list.length; i++) {
    if (!_.isDef(min) || list[i] < min) min = list[i];
  }
  return min;
};

_.options = function(options, expected) {
  return _.defaults(_.clone(options) || {}, expected);
};

_.ifDef = function(value, valueWhenUndefined) {
  return _.isDef(value) ? value : valueWhenUndefined;
};

_.pad = function(num, padding) {
  var numAsStr = '' + num;
  return _.repeat('0', padding - numAsStr.length) + numAsStr;
};

_.unimplemented = function() {
  throw 'This function has not been implemented!';
};

_.RADIANS_2 = _.radians(2);
_.RADIANS_90 = _.radians(90);
_.RADIANS_120 = _.radians(120);
_.RADIANS_178 = _.radians(180);
_.RADIANS_180 = _.radians(180);
_.RADIANS_270 = _.radians(270);
_.RADIANS_360 = _.radians(360);

_.geometry = {};
_.geometry.circumscribeTriangle = function(x, y, radius, rotation) {
  var result = {};
  result.x1 = Math.cos(rotation) * radius + x;
  result.y1 = Math.sin(rotation) * radius + y;
  rotation += _.RADIANS_120;
  result.x2 = Math.cos(rotation) * radius + x;
  result.y2 = Math.sin(rotation) * radius + y;
  rotation += _.RADIANS_120;
  result.x3 = Math.cos(rotation) * radius + x;
  result.y3 = Math.sin(rotation) * radius + y;
  return result;
};

// Returns a set of angles evenly distributed across an angle.
_.geometry.spread = function(angle, numPoints) {
  var points = new Array(numPoints);
  var da = angle / (numPoints - 1);
  var start = angle / 2;
  for (var i = 0; i < numPoints; i++) {
    points[i] = da * i - start;
  };
  return points;
};

_.geometry.aimPosition = function(source, target, targetVector, targetSpeed,
                                  projectileSpeed, projectileLength,
                                  leadRatio) {
  if (projectileSpeed <= targetSpeed) return target;
  var d = _.distance(source, target) - projectileLength;
  if (d < 10) return target;
  var targetToAimPos = _.angle(targetVector);
  if (isNaN(targetToAimPos)) return target;
  var targetToSource = _.angle(target, source);
  if (isNaN(targetToSource)) return target;
  var da = _.angleDif(targetToSource, targetToAimPos);
  if (da < _.RADIANS_2 || da > _.RADIANS_178) return target;

  // Solve for t = time, where 0 = at^2 + bt + c.
  var a = projectileSpeed * projectileSpeed - targetSpeed * targetSpeed;
  var b = 2 * targetSpeed * d * Math.cos(da);
  var c = -(d * d);
  var time = _.quadratic(a, b, c);
  if (time > 10) return target;

  return {
    x: target.x + Math.cos(targetToAimPos) * targetSpeed * time * leadRatio,
    y: target.y + Math.sin(targetToAimPos) * targetSpeed * time * leadRatio,
    distance: d,
    time: time
  };
};

_.vector = {};

_.vector.cartesian = function(v) {
  if (!_.isDef(v.x) && !_.isDef(v.y)) {
    v.x = Math.cos(v.angle) * v.length;
    v.y = Math.sin(v.angle) * v.length;
    delete v.angle;
    delete v.length;
  }
  return v;
};

_.vector.add = function(v1, v2) {
  _.vector.cartesian(v1);
  _.vector.cartesian(v2);
  v1.x += v2.x;
  v1.y += v2.y;
};

_.vector.normalize = function(v) {
  if (v.x && v.y) {
    var d = Math.hypot(v.x, v.y);
    v.x /= d;
    v.y /= d;
  } else {
    v.x = v.y = 0;
  }
};

_.vector.EMPTY = {x: 0, y: 0, angle: 0, length: 0};

_.vector.isEmpty = function(v) {
  return v.x == 0 && v.y == 0;
};

_.class = {};
_.class.extend = function(destination, source) {
  for (var key in source) {
    destination[key] = destination[key] || source[key];
  }
  destination.base_ = source;
};
