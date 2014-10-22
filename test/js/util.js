describe('util functions', function() {
  describe('valueOrFn:', function() {
    it('returns result from function call when a function', function() {
      var fn = function() { return 5; };
      expect(_.valueOrFn(fn)).toBe(5);
    });

    it('returns the value when a value', function() {
      expect(_.valueOrFn(6)).toBe(6);
    });
  });
});
