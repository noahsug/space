jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

xdescribe('Game performance', function() {
  initTestEnvironment(this);
  var MAX_SAMPLES = 700;
  var avgLogic, avgRender, count;

  beforeEach(function(done) {
    //document.getElementById('hide-canvas').style.display = "";

    count = avgLogic = avgRender = 0;
    var gameRunner = di.get('GameRunner');
    spyOn(gameRunner, 'update_').and.callFake(function(dt) {
      count++;

      // Logic update.
      var lastTime = _.now();
      gameRunner.game_.update(dt);
      var now = _.now();
      if (count > MAX_SAMPLES / 2) avgLogic += now - lastTime;

      // Render update.
      lastTime = _.now();
      gameRunner.renderer_.update(dt);
      now = _.now();
      if (count > 100) avgRender += now - lastTime;

      // Finish update.
      gameRunner.mouse_.clearInput();

      if (count == MAX_SAMPLES) {
        gameRunner.stop();
        avgLogic /= MAX_SAMPLES / 2;
        avgRender /= MAX_SAMPLES / 2;
        done();
      }
    });

    start();
  });

  it('avg times', function() {
    console.log('Avg render time:', avgRender);
    console.log('Avg logic time:', avgLogic);
  });
});

xdescribe('List performance', function() {
  var NUM_TESTS = 1000;
  var output;

  function getAvgTime(fn) {
    var totalTime = 0;
    for (var i = 0; i < NUM_TESTS; i++) {
      var start = _.now();
      fn();
      var end = _.now();
      totalTime += end - start;
    }
    return totalTime / NUM_TESTS;
  }

  it('array', function() {
    var avgTime = getAvgTime(function() {
      var a = [];
      for (var i = 0; i < 100; i++) {
        a.push(i * 2);
      }
      output = '';
      for (var i = 0; i < a.length; i++) {
        output += a[i];
      }
    });
    console.log('Array:', avgTime);
  });

  it('array fixed size', function() {
    var a = new Array(10);
    var len = 0;
    var avgTime = getAvgTime(function() {
      len = 0;
      for (var i = 0; i < 100; i++) {
        a[len++] = i * 2;
      }
      output = '';
      for (var i = 0; i < len; i++) {
        output += a[i];
      }
    });
    console.log('Array fixed:', avgTime);
  });

  it('array fixed size with doubling', function() {
    var a = new Array(10);
    var len = 0;
    var avgTime = getAvgTime(function() {
      len = 0;
      for (var i = 0; i < 100; i++) {
        if (len <= a.length) {
          a[len * 2 - 1] = 0;
        }
        a[len++] = i * 2;
      }
      output = '';
      for (var i = 0; i < len; i++) {
        output += a[i];
      }
    });
    console.log('Array fixed double:', avgTime);
  });

  it('list', function() {
    var a = new List(10);
    var avgTime = getAvgTime(function() {
      a.clear();
      for (var i = 0; i < 100; i++) {
        a.push(i * 2);
      }
      output = '';
      for (var i = 0; i < a.length; i++) {
        output += a.arr[i];
      }
    });
    console.log('List:', avgTime);
  });

  it('list 2', function() {
    var a = new List(10);
    var avgTime = getAvgTime(function() {
      a.length = 0;
      for (var i = 0; i < 100; i++) {
        a.arr[a.length++] = i * 2;
      }
      output = '';
      for (var i = 0; i < a.length; i++) {
        output += a.arr[i];
      }
    });
    console.log('List 2:', avgTime);
  });
});
