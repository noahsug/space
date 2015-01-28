describe('Collision detection', function() {
  var collision;

  beforeEach(function() {
    collision = di.get('Collision');
  });

  it('circlePoint', function() {
    var c = {x: 0, y: 4, radius: .5};
    var p = {x: 1, y: 4};
    expect(collision.circlePoint(c, p)).toBe(false);

    c.radius += .5;
    expect(collision.circlePoint(c, p)).toBe(true);

    c.radius += .5;
    expect(collision.circlePoint(c, p)).toBe(true);
  });

  it('pointCircle', function() {
    var c = {x: 0, y: 4, radius: .5};
    var p = {x: 1, y: 4};
    expect(collision.pointCircle(p, c)).toBe(false);

    c.radius += .5;
    expect(collision.pointCircle(p, c)).toBe(true);

    c.radius += .5;
    expect(collision.pointCircle(p, c)).toBe(true);
  });

  it('circleCircle', function() {
    var c = {x: 0, y: 4, radius: .5};
    var c2 = {x: 1.5, y: 4, radius: .5};
    expect(collision.circleCircle(c, c2)).toBe(false);

    c.radius += .5;
    expect(collision.circleCircle(c, c2)).toBe(true);

    c.radius += .5;
    expect(collision.circleCircle(c, c2)).toBe(true);
  });

  it('circleLine', function() {
    var c = {x: 0, y: 5, radius: 1};

    // Inside circle.
    var l = {x: 0, y: 5, dx: -.5, dy: -.5, length: Math.hypot(.5, .5)};
    expect(collision.circleLine(c, l)).toBe(true);

    // Right end in circle.
    l.x = -0.5, l.y = 4.5;
    expect(collision.circleLine(c, l)).toBe(true);

    // Right end almost in circle.
    l.x = -1, l.y = 4;
    expect(collision.circleLine(c, l)).toBe(false);

    // Left end in circle.
    l.x = 1, l.y = 6;
    expect(collision.circleLine(c, l)).toBe(true);

    // Left end almost in circle.
    l.x = 1.5, l.y = 6.5;
    expect(collision.circleLine(c, l)).toBe(false);

    // Pass through circle.
    l = {x: -5, y: 6, dx: 10, dy: -1, length: Math.hypot(10, 1)};
    expect(collision.circleLine(c, l)).toBe(true);

    // Pass through circle from right side.
    l.x = 5, l.dx = -10;
    expect(collision.circleLine(c, l)).toBe(true);

    // Pass through circle from bottom side.
    l.y = 4, l.dy = 1;
    expect(collision.circleLine(c, l)).toBe(true);

    // Miss circle.
    l.dy = -1;
    expect(collision.circleLine(c, l)).toBe(false);

    // Tanget to circle.
    l = {x: -5, y: 6, dx: 10, dy: 0, length: Math.hypot(10, 0)};
    expect(collision.circleLine(c, l)).toBe(true);
  });

  it('textPoint', function() {
    var t = {x: 0, y: 4, text: 'hi', size: '10', align: 'center',
             baseline: 'middle'};
    var p = {x: 0, y: 10};
    expect(collision.textPoint(t, p)).toBe(false);

    t.y = 9;
    expect(collision.textPoint(t, p)).toBe(true);

    t.y = 8;
    expect(collision.textPoint(t, p)).toBe(true);

    t.x = 5;
    expect(collision.textPoint(t, p)).toBe(false);

    t.x = 3.5;
    expect(collision.textPoint(t, p)).toBe(true);
  });
});
