document.addEventListener("DOMContentLoaded", function() {
  di.constant('canvas', document.getElementsByTagName('canvas')[0]);
});

di.constant('requestAnimationFrame', window.requestAnimationFrame ||
    function(callback) {
      var interval = 1000 / 60;  // 60 fps
      return window.setTimeout((function() { callback(interval); }), interval)
    });

di.constant('cancelAnimationFrame',
    window.cancelAnimationFrame || window.clearTimeout);

di.constant('timeout', function(fn, opt_delay) {
  return window.setTimeout(fn, opt_delay);
});
