window.initTestEnvironment = function(test) {
  var appDi = di;

  test.inject = function(fn) {
    di = cloneDi(appDi);
    fn();
    di.init();
  };

  test.afterEach(function() {
    di = appDi;
  });
};

function cloneDi(di) {
  newDi = new Di();
  newDi.implsToInit_ = di.implsToInit_;
  newDi.mappings_ = di.mappings_;
}
