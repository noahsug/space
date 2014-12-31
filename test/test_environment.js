// Use this if you are modifying di or want to use inject() or start().
window.initTestEnvironment = function(test) {
  var appDi = di;

  test.beforeEach(function() {
    di = appDi.clone();
    di.init();
  });

  test.afterEach(function() {
    di = appDi;
  });

  test.inject = inject;
  test.start = start;
};

function inject(fn) {
  fn();
  di.init();
}

function start() {
  var main = di.get('Main');
  spyOn(main, 'on_');
  main.start();
}

// Stop game from actually running.
di.start = Function;
