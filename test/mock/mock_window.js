mock.register('window', function(name) {
  var mock = {};
  mock.addEventListener = window.addEventListener.bind(window);
  return di.constant(name, mock);
});
