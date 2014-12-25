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

  this.on_('mousemove', 'touchmove', function(e) {
    this.mouse_.onMouseMove(e);
  }, {running:true});

  this.on_('mousedown', 'touchdown', function() {
    this.mouse_.onMouseDown();
  }, {running:true});

  this.on_('mouseup', 'touchend', function() {
    this.mouse_.onMouseUp();
  }, {running:true});

  //this.random_.seed(.02);
  this.screen_.setSurfaceArea(Screen.DESIRED_SURFACE_AREA);
  this.gameRunner_.start();
};

Main.prototype.on_ = function(var_events, fn, opt_req) {
  var events, req;
  if (_.isObject(arguments[arguments.length - 1])) {
    events = _.args(arguments).slice(0, arguments.length - 2);
    req = arguments[arguments.length - 1];
    fn = arguments[arguments.length - 2];
  } else {
    events = _.args(arguments).slice(0, arguments.length - 1);
    req = {};
    fn = arguments[arguments.length - 1];
  }

  _.each(events, function(event) {
    this.window_.addEventListener(event, function(e) {
      if (_.isDef(req.running) && req.running != this.gameRunner_.isRunning())
        return;
      fn.call(this, e);
    }.bind(this));
  }, this);
};

di.start(function() {
  di.get('Main').start();
});
