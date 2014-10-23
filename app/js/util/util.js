_.radians = function(degrees) {
  return degrees * Math.PI / 180;
};

_.isDef = function(value) {
  return !_.isUndefined(value);
};

_.valueOrFn = function(valueOrFn) {
  if (typeof valueOrFn == 'function') {
    return valueOrFn();
  } else {
    return valueOrFn;
  }
};

var uidCount = 0;
_.uid = function(obj) {
  if (obj.__hash__) {
    return obj.__hash__;
  }
  return obj.__hash__ = uidCount++;
};
