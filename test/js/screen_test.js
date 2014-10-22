describe('screen', function() {
  initTestEnvironment(this);
  var screen;

  beforeEach(function() {
    screen = di.get('Screen');

    var mockWindow = mock.mock('window');
    mockWindow.innerWidth = 100;
    mockWindow.innerHeight = 150;
    screen.init();

    screen.setSurfaceArea(100 * 150 / 2);
    screen.center(20, 10);
  });

  it('translates game coordinates into canvas coordinates', function() {
    var pos = screen.translate(25, 40);
    expect(pos.x).toBe(55);
    expect(pos.y).toBe(105);
  });

  it('translates mouse coordinates into canvas coordinates', function() {
    var pos = screen.translateMouse(50, 75);
    expect(pos.x).toBe(40);
    expect(pos.y).toBe(70);
  });
});
