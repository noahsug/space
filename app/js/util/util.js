_.radians = function(degrees) {
  return degrees * Math.PI / 180;
};

_.isDef = function(value) {
  return value != undefined;
};

_.valueOrFn = function(valueOrFn) {
  if (typeof valueOrFn == 'function') {
    return valueOrFn();
  } else {
    return valueOrFn;
  }
};
