window.initTestEnvironment = function(test) {
  var appDi = di;

  test.beforeEach(function() {
    di = appDi.clone();
    di.init();
  });

  test.afterEach(function() {
    di = appDi;
  });
};
