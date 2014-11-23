var Main = di.service('Main', [
  'Game', 'GameRunner', 'Mouse', 'Screen', 'window', 'Random']);

Main.prototype.start = function() {
  this.on_('blur', function() {
    this.gameRunner_.stop();
  }, {running:true});

  this.on_('focus', function() {
    this.gameRunner_.run();
    this.screen_.resize();
  }, {running:false});

  this.on_('resize', function() {
    this.screen_.resize();
  }, {running:true});

  this.on_('mousemove', function(e) {
    this.mouse_.onMouseMove(e);
  }, {running:true});

  this.on_('mousedown', function() {
    this.mouse_.onMouseDown();
  }, {running:true});

  this.on_('mouseup', function() {
    this.mouse_.onMouseUp();
  }, {running:true});

  this.random_.seed();
  this.screen_.setSurfaceArea(Screen.DESIRED_SURFACE_AREA);
  this.gameRunner_.start();
};

Main.prototype.on_ = function(event, fn, opt_req) {
  var req = opt_req || {};
  this.window_.addEventListener(event, function(e) {
    if (_.isDef(req.running) && req.running != this.gameRunner_.isRunning())
      return;
    fn.call(this, e);
  }.bind(this));
};

di.start(function() {
  di.get('Main').start();
});
