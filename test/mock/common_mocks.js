mock.register('window', function(name) {
  var mock = {};
  mock.addEventListener = window.addEventListener.bind(window);
  return di.constant(name, mock);
});

mock.register('Renderer', function(name) {
  di.service(name).prototype.update = function() {};
});

mock.register('GameRunner', function(name) {
  var GameRunner = di.service(name);
  GameRunner.prototype.start = function() {};
  GameRunner.prototype.isRunning = function() { return false; };
});
