jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

describe('Game performance', function() {
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
