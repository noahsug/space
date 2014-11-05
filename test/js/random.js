describe('random', function() {
  var rand;

  beforeEach(function() {
    rand = di.get('Random');
    rand.seed(.1);
  });

  it ('can get the next int within a range, inclusively', function() {
    var low = 0, high = 0;
    for (var i = 0; i < 1000; i++) {
      var r = rand.nextInt(4, 17);
      if (r == 4) low++;
      if (r == 17) high++;
      expect(Math.floor(r)).toBe(r);
      expect(r >= 4 && r <= 17);
    }
    expect(low > 0).toBe(true);
    expect(high > 0).toBe(true);
  });
});
