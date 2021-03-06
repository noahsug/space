di.constant('window', window);

di.ready(function() {
  var canvas = window.document.getElementById('fg');
  di.constant('canvas', canvas);
  di.constant('ctx', canvas.getContext('2d'));

  var textCanvas = window.document.getElementById('text-fg');
  di.constant('textCanvas', textCanvas);
  di.constant('textCtx', textCanvas.getContext('2d'));

  var bgs = [];
  var bgCtxs = [];
  for (var i = 0; i < 3; i++) {
    var bgCanvas = window.document.getElementById('bg' + (i + 1));
    bgs.push(bgCanvas);
    bgCtxs.push(bgCanvas.getContext('2d'));
  }
  di.constant('bgCanvasList', bgs);
  di.constant('bgCtxList', bgCtxs);
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
