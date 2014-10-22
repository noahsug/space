mock.register('window', function(name) {
  var mock = {};
  return di.constant(name, mock);
});
