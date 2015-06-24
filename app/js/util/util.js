_.emptyFn = function() {};

_.is = function(value, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
  return value == arg1 ||
    value == arg2 ||
    value == arg3 ||
    value == arg4 ||
    value == arg5 ||
    value == arg6 ||
    value == arg7;
};

_.roundTo = function(value, nearest) {
  return Math.round(value / nearest) * nearest;
};

_.radians = function(degrees) {
  return degrees * Math.PI / 180;
};

_.degrees = function(radians) {
  return radians * 180 / Math.PI;
};

_.plural = function(string, num) {
  return num == 1 ? string : string + 's';
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

_.sum = function(arr) {
  return arr.reduce(function(p, c) { return p + c; });
};

_.return = function(v) {
  return function() { return v; };
};

_.repeat = function(fn, times) {
  for (var i = 0; i < times; i++) {
    fn(i);
  }
};

_.remove = function(arr, value) {
  var index = arr.indexOf(value);
  if (index != -1) {
    return arr.splice(value, 1, 0)[0];
  }
  return null;
};

_.move = function(arr, from, to) {
  var r = arr.splice(from, 1);
  if (from < to) to--;
  arr.splice(to, 0, r[0]);
};

_.swap = function(obj, a, b) {
  if (a == b) return;
  var temp = obj[a];
  obj[a] = obj[b];
  obj[b] = temp;
};

// Returns a normalized, random array of values.
_.randomSplit = function(size, opt_total) {
  return _.normalize(_.generate(Math.random, size), opt_total || 1);
};

_.intRandomSplit = function(size, opt_total, opt_max) {
  var total = _.orDef(opt_total, 1);
  if (opt_max) {
    if (opt_max * size <= total) return _.generate(_.return(opt_max), size);
    var split = _.generate(_.return(0), size);
    var totalSoFar = 0;
    var capped = {};
    while (totalSoFar < total) {
      var index = _.r.nextInt(0, size - 1);
      while (capped[index]) index = (index + 1) % split.length;
      split[index]++;
      totalSoFar++;
      if (split[index] >= opt_max) capped[index] = true;
    }
    return split;
  } else {
    return _.intNormalize(_.generate(Math.random, size), total);
  }
};

_.normalize = function(arr, opt_total) {
  var sum = _.sum(arr);
  return arr.map(function(v) { return (opt_total || 1) * v / sum; });
};

_.intNormalize = function(arr, opt_total) {
  var sum = _.sum(arr);
  var remainder = 0;
  return arr.map(function(v) {
    var normalized = (opt_total || 1) * v / sum;
    var int = Math.floor(normalized);
    remainder += normalized - int;
    if (remainder >= .999999) {
      int++;
      remainder--;
    }
    return int;
  });
};

// Split a line of text in half at the whitespace.
_.splitText = function(text) {
  var half = Math.floor(text.length / 2);
  var split = half;
  for (var i = half + 3; i >= 0; i--) {
    if (text[i] == ' ') {
      split = i;
      break;
    }
  }
  return [text.slice(0, i), text.slice(i + 1)];
};

_.assert = function(truth, msg) {
  if (PROD) return;
  if (!truth) {
    throw 'Assert failed: ' + msg;
  }
};

_.fail = function(msg) {
  if (PROD) return;
  _.assert(false, msg);
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

// Moves value towards target, but not past it.
_.approach = function(value, target, absAmount) {
  var d = target - value;
  if (Math.abs(d) < absAmount) {
    return target;
  }
  return value + absAmount * Math.sign(d);
};

// Moves value towards target, but not past it.
_.approachAngle = function(value, target, absAmount) {
  var d = _.angleDif(target, value);
  if (d < absAmount) {
    return target;
  }
  var a1 = value + absAmount;
  var a2 = value - absAmount;
  return _.angleDif(a1, target) < _.angleDif(a2, target) ? a1 : a2;
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

_.parse = function(context, str, opt_createNew) {
  var obj = context;
  var names = str.split('.');
  for (var i = 0; i < names.length; i++) {
    var name = names[i];
    if (!_.isDef(obj[name])) {
      if (opt_createNew) obj[name] = {};
      else return undefined;
    }
    obj = obj[name];
  }
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

_.sampleKey = function(obj) {
  return _.sample(_.keys(obj));
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

_.newSet = function(values) {
  var set = {};
  for (var i = 0; i < values.length; i++) {
    set[values[i]] = i + 1;
  }
  return set;
};

_.newList = function(list, generator, opt_thisObj) {
  var result = new Array();
  for (var i = 0; i < list.length; i++) {
    var value = generator.call(opt_thisObj, list[i], i);
    if (value !== undefined) result.push(value);
  }
  return result;
};

_.min = function(list) {
  var min;
  for (var i = 0; i < list.length; i++) {
    if (!_.isDef(min) || list[i] < min) min = list[i];
  }
  return min;
};

_.pathExists = function(start, addNeighbors, atEnd, hash) {
  // TODO: Implement this if needed.
  var visited = {};
  visited[hash(start)] = true;
  return true;
};

_.between = function(value, min, max) {
  return value >= min && value <= max;
};

_.options = function(overrides, defaults) {
  return _.defaults(_.clone(overrides) || {}, defaults);
};

_.orDef = function(value, valueWhenUndefined) {
  return _.isDef(value) ? value : valueWhenUndefined;
};

_.pad = function(num, padding) {
  var numAsStr = '' + num;
  return _.repeat('0', padding - numAsStr.length) + numAsStr;
};

// step(25, 0, 25, 75, 100) = 0;
// step(50, 0, 25, 75, 100) = .5;
// step(75, 0, 25, 75, 100) = 1;
_.step = function(value, s1, s2, e1, e2) {
  if (value >= e2) return 1;
  if (value <= s1) return 0;
  return (value - s2) / (e1 - s2);
};

_.callForEach = function(list, obj, fnName) {
  _.each(list, obj[fnName].bind(obj));
};

_.unimplemented = function() {
  throw 'This function has not been implemented!';
};

_.RADIANS_2 = _.radians(2);
_.RADIANS_90 = _.radians(90);
_.RADIANS_120 = _.radians(120);
_.RADIANS_135 = _.radians(135);
_.RADIANS_178 = _.radians(178);
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

_.deepClone = function(o) {
  return JSON.parse(JSON.stringify(o));
};

_.vector = {};

_.vector.length = function(v) {
  return _.orDef(v.length, _.distance(v));
};

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
  return v1;
};

_.vector.normalize = function(v) {
  var d = Math.hypot(v.x, v.y);
  v.x /= d;
  v.y /= d;
  return v;
};

_.vector.mult = function(v, r) {
  v.x *= r;
  v.y *= r;
  return v;
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
};
