describe('screen', function() {
  initTestEnvironment(this);
  var screen;

  beforeEach(function() {
    inject(function() {
      var mockWindow = mock.mock('window');
      mockWindow.innerWidth = 100;
      mockWindow.innerHeight = 150;
    });
    screen = di.get('Screen');
    screen.setSurfaceArea(100 * 150 / 4);
    screen.center(20, 10);
  });

  it('translates game coordinates into canvas coordinates', function() {
    var pos = screen.canvasToDraw(25, 40);
    expect(pos.x).toBe(30);
    expect(pos.y).toBe(67.5);
  });

  it('translates mouse coordinates into canvas coordinates', function() {
    var pos = screen.screenToCanvas(25, 40);
    expect(pos.x).toBe(7.5);
    expect(pos.y).toBe(-7.5);
  });
});
