describe('Util function:', function() {
  describe('valueOrFn', function() {
    it('returns the value when a value', function() {
      expect(_.valueOrFn(6)).toBe(6);
    });

    it('returns result from function call when a function', function() {
      var fn = function() { return 5; };
      expect(_.valueOrFn(fn)).toBe(5);
    });

    it('can pass arguments to the function', function() {
      var fn = function(x) { return x; };
      expect(_.valueOrFn(fn, 5)).toBe(5);
    });
  });

  describe('parse', function() {
    it('returns an existing value', function() {
      var obj = {name: 'sally'};
      expect(_.parse(obj, 'name')).toBe('sally');
    });

    it('creates a new value if needed', function() {
      var obj = {};
      _.parse(obj, 'name');
      expect(_.parse(obj, 'name')).toBe(obj.name);
    });

    it('creates multiple new values if needed', function() {
      var obj = {};
      expect(_.parse(obj, 'name.firstName')).toBe(obj.name.firstName);
    });
  });

  describe('args', function() {
    it('returns the partitioned arguments as one array', function() {
      var result;
      function test() { result = _.args(arguments, 0, 2); }
      test(4, 6, 9, 10);
      expect(result).toEqual([4, 9, 10]);
    });

    it('turns arguments into an array when no args are passed', function() {
      var result;
      function test() { result = _.args(arguments); }
      test(4, 6, 9, 10);
      expect(result).toEqual([4, 6, 9, 10]);
    });
  });

  describe('uid', function() {
    it('uniquely identifies an object', function() {
      var a = {};
      var b = {};
      expect(_.uid(a)).not.toEqual(_.uid(b));
      expect(_.uid(a)).toEqual(_.uid(a));
    });
  });

  describe('pseudorandom', function() {
    it('returns the same result when given the same seed', function() {
      expect(_.pseudorandom(.1)).not.toBe(_.pseudorandom(.2));
      expect(_.pseudorandom(.1)).toBe(_.pseudorandom(.1));
    });
    it('has a uniform distribution between 0 and 1', function() {
      var results = [];
      var seed = _.pseudorandomSeed(0);
      for (var i = 0; i < 1000; i++) {
        var rand = Math.floor(_.pseudorandom(seed) * 10);
        seed = _.pseudorandomSeed(seed);
        results[rand] = results[rand] ? results[rand] + 1 : 1;
      }
      results.forEach(function(r) {
        expect(r > 80).toBe(true);
      });
    });
  });

  describe('decorator', function() {
    describe('.eventEmitter', function() {
      var obj;
      beforeEach(function() {
        obj = {};
        _.decorate(obj, _.decorator.eventEmitter);
      });

      it('adds method .on("event", callback)', function() {
        expect(obj.on).toBeDefined();
      });

      it('adds private method emit_("event", args)', function() {
        expect(obj.emit_).toBeDefined();
      });

      it('listeners get notified when an event is emitted', function() {
        var callback = jasmine.createSpy('callback');
        obj.on('event', callback);

        expect(callback).not.toHaveBeenCalled();
        obj.emit_('event', 113, 'sally');
        expect(callback).toHaveBeenCalledWith(113, 'sally');
      });

      it('allows listeners to listen to multiple events', function() {
        var callback = jasmine.createSpy('callback');
        obj.on('event', 'event2', callback);

        expect(callback).not.toHaveBeenCalled();
        obj.emit_('event', 113, 'sally');
        expect(callback).toHaveBeenCalledWith(113, 'sally');
        obj.emit_('event2', 456, 'bob');
        expect(callback).toHaveBeenCalledWith(456, 'bob');
      });

      describe('.eventFn', function() {
        beforeEach(function() {
          obj.ready = _.decorator.eventEmitter.eventFn('ready');
        });

        it('listeners get notified when the event fn is called', function() {
          var callback = jasmine.createSpy('callback');
          obj.ready(callback);

          expect(callback).not.toHaveBeenCalled();
          var args = {color:'blue'};
          obj.ready(args);
          expect(callback).toHaveBeenCalledWith(args);
        });

        it('listeners get notified when the event is emitted', function() {
          var callback = jasmine.createSpy('callback');
          obj.ready(callback);

          expect(callback).not.toHaveBeenCalled();
          var args = {color:'blue'};
          obj.ready(args);
          expect(callback).toHaveBeenCalledWith(args);
        });
      });
    });
  });

  describe('pickFunctions', function() {
    it('extracts functions from an class', function() {
      var calls = '';
      var Dog = function() {};
      Dog.prototype.barkLoud_ = function() { calls += 'loud'; };
      Dog.prototype.barkSoft_ = function() {calls += 'soft';};
      var sam = new Dog();
      var fns = _.pickFunctions(sam, {prefix: 'bark', suffix: '_'});

      expect(calls).toBe('');
      fns['loud']();
      fns['soft']();
      expect(calls).toBe('loudsoft');
    });

    it('binds the extracted functions to the instance', function() {
      var Dog = function() {};
      Dog.prototype.bark = function() { this.barked = true; };
      var sam = new Dog();
      var fns = _.pickFunctions(sam);
      fns['bark']();
      expect(sam.barked).toBe(true);
    });
  });

  describe('key', function() {
    it('picks any key from an object', function() {
      var guns = {shotgun: 'red'};
      expect(_.key(guns)).toBe('shotgun');
    });
  });

  describe('swap', function() {
    it('swaps two properties on an object', function() {
      var obj = {x: 5, y: 6};
      _.swap(obj, 'x', 'y');
      expect(obj.x).toBe(6);
      expect(obj.y).toBe(5);
    });
  });
});
