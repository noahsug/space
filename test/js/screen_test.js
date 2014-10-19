describe('screen', function() {
  initTestEnvironment(this);
  var screen;

  beforeEach(function() {
    screen = di.get('Screen');
    screen.zoom(2);
    screen.center(20, 10);
    screen.width = 100;
    screen.height = 150;
  });

  it('translates coordinates into canvas coordinates', function() {
    var pos = screen.translate(50, 75);
    expect(pos.x).toBe(80);
    expect(pos.y).toBe(140);
  });
});
