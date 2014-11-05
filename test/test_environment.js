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
};

function inject(fn) {
  fn();
  di.init();
}

// Stop game from actually running.
Main.prototype.init = function() {};
