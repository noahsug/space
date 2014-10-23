di.constant('window', window);

di.ready(function() {
  var canvas = window.document.getElementsByTagName('canvas')[0];
  di.constant('canvas', canvas);
  di.constant('ctx', canvas.getContext('2d'));
});

di.constant('requestAnimationFrame',
    window.requestAnimationFrame.bind(window) ||
    function(callback) {
      var interval = 1000 / 60;  // 60 fps
      return window.setTimeout((function() { callback(interval); }), interval);
    });

di.constant('cancelAnimationFrame',
    window.cancelAnimationFrame.bind(window) ||
    window.clearTimeout.bind(window));
