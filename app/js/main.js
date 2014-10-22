var Main = di.service('Main', [
  'Game', 'GameRunner', 'Mouse', 'Screen', 'window']);

Main.prototype.init = function() {
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

  this.screen_.setSurfaceArea(134400);
  this.screen_.center(0, -this.screen_.height / 6);
  this.gameRunner_.run();
};

Main.prototype.on_ = function(event, fn, opt_req) {
  var req = opt_req || {};
  this.window_.addEventListener(event, function(e) {
    if (_.isDef(req.running) && req.running != this.gameRunner_.isRunning())
      return;
    fn.call(this, e);
  }.bind(this));
};
