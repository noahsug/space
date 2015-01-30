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
      expect(_.parse(obj, 'name', true)).toBe(obj.name);
    });

    it('creates multiple new values if needed', function() {
      var obj = {};
      expect(_.parse(obj, 'name.firstName', true)).toBe(obj.name.firstName);
    });
  });

  describe('set', function() {
    it('sets a value multiple keys deep', function() {
      var obj = {person: {name: 'sally'}};
      _.set(obj, 'person.name', 'bob');
      expect(obj.person.name).toBe('bob');
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

      it('adds private method emit_("event", arg)', function() {
        expect(obj.emit_).toBeDefined();
      });

      it('listeners get notified when an event is emitted', function() {
        var callback = jasmine.createSpy('callback');
        obj.on('event', callback);

        expect(callback).not.toHaveBeenCalled();
        obj.emit_('event', 113);
        expect(callback).toHaveBeenCalledWith(113);
      });

      describe('.eventFn', function() {
        beforeEach(function() {
          obj.ready = _.eventFn('ready');
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
      expect(obj).toEqual({x: 6, y: 5});
    });
  });

  describe('modObj', function() {
    it('adds values to an object', function() {
      var obj = {x: 1, y: 2, z: 3};
      _.modObj(obj, {x: 5, y: 6});
      expect(obj).toEqual({x: 6, y: 8, z: 3});
    });
  });

  describe('findIndex', function() {
    it('returns index of first item that passes the test', function() {
      var list = [{x: 1}, {y: 2}, {z: 3}];
      var isEven = function(o) { return _.value(o) % 2 == 0; };
      var isOdd = function(o) { return _.value(o) % 2 == 1; };
      expect(_.findIndex(list, isEven)).toBe(1);
      expect(_.findIndex(list, isOdd)).toBe(0);
    });
  });

  describe('findIndexWhere', function() {
    it('returns index of first item that matches the attrs', function() {
      var list = [{x: 1}, {y: 2}, {z: 3}];
      expect(_.findIndexWhere(list, {y: 2})).toBe(1);
      expect(_.findIndexWhere(list, {y: 3})).toBe(-1);
      expect(_.findIndexWhere(list, {x: 2})).toBe(-1);
    });
  });

  describe('generateColor', function() {
    it('Generates a color based on a passed in value in [0, 1]', function() {
      color = _.generateColor(.5);
      expect(color).toBe('#800000');
    });
  });

  describe('generateGray', function() {
    it('Generates a gray based on a passed in value in [0, 1]', function() {
      color = _.generateGray(.5);
      expect(color).toBe('#808080');
    });
  });

  describe('repeat', function() {
    it('Repeats a string n times', function() {
      expect(_.repeat('hi', 3)).toBe('hihihi');
    });
  });

  describe('moveTowards', function() {
    it('Moves a point closer to another point', function() {
      var p1 = {x: 4, y: 5};
      _.moveTowards(p1, {x: 7, y: 9}, 2.5);
      expect(p1).toEqual({x: 5.5, y: 7});
    });

    it('Doesn\'t move farther then the target point', function() {
      var p1 = {x: 4, y: 5};
      _.moveTowards(p1, {x: 7, y: 9}, 6);
      expect(p1).toEqual({x: 7, y: 9});
    });

    it('Doesn\'t move when at target point', function() {
      var p1 = {x: 0, y: 0};
      _.moveTowards(p1, {x: 0, y: 0}, .004);
      expect(p1).toEqual({x: 0, y: 0});
    });
  });

  describe('generate', function() {
    it('generates a list by calling a function n times', function() {
      var list = _.generate(function(i) {
        return i * i;
      }, 4);
      expect(list).toEqual([0, 1, 4, 9]);
    });
  });

  describe('pad', function() {
    it('adds 0s on front of a number so it is the correct length', function() {
      expect(_.pad(113, 5)).toBe('00113');
      expect(_.pad(88, 2)).toBe('88');
      expect(_.pad(3, 0)).toBe('3');
    });
  });

  describe('circumscribeTriangle', function() {
    it('returns points of a triangle circumscribed in a circle', function() {
      var t1 = _.geometry.circumscribeTriangle(5, 10, 1, 0);
      var t2 = _.geometry.circumscribeTriangle(5, 10, 1, _.radians(120));
      expect(t1).toEqual({x1: t2.x3, y1: t2.y3,
                          x2: t2.x1, y2: t2.y1,
                          x3: t2.x2, y3: t2.y2});
    });
  });

  describe('aimPosition', function() {
    var source, target, targetVector, targetSpeed;
    var projectileSpeed, projectileLength, leadRatio;

    function getAimPos() {
      return _.geometry.aimPosition(source, target, targetVector, targetSpeed,
                                    projectileSpeed, projectileLength,
                                    leadRatio);
    }

    beforeEach(function() {
      source = {x: 0, y: 0};
      target = {x: 15, y: 0};
      targetVector = {x: 0, y: 1};
      targetSpeed = projectileLength = 1;
      projectileSpeed = 2;
      leadRatio = 1;
    });

    describe('returns where to aim to hit a moving target', function() {
      it('on top of target', function() {
        target = source;
        expect(getAimPos()).toEqual(target);
      });

      it('very close to target', function() {
        target = {x: 5, y: 0};
        expect(getAimPos()).toEqual(target);
      });

      it('target isnt moving', function() {
        targetVector = {x: 0, y: 0};
        expect(getAimPos()).toEqual(target);
      });

      it('projectile is moving slower then target', function() {
        projectileSpeed = targetSpeed - .1;
        expect(getAimPos()).toEqual(target);
      });

      it('projectile will take > 10 seconds to reach target', function() {
        projectileSpeed = targetSpeed + .1;
        target = {x: 1500, y: 0};
        expect(getAimPos()).toEqual(target);
      });

      it('target is moving down', function() {
        var aimPos = getAimPos();
        expect(aimPos.x).toBe(target.x);
        expect(Math.abs(aimPos.y - 8.08) < .01).toBe(true);
      });
    });
  });
});
