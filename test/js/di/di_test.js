describe('DI', function() {
  initTestEnvironment(this);

  beforeEach(function() {
    di = new Di();
  });

  function given(fn) {
    fn();
    di.init();
  }

  function setTestInit(ImplClass, opt_fn) {
    ImplClass.prototype.init = function(var_args) {
      ImplClass.instance = this;
      this.args = Array.prototype.slice.call(arguments);
      opt_fn && opt_fn(this);
    };
  }

  it('can return an implementation', function() {
    given(function() {
      di.service('Tire');
      di.service('Car', ['Tire']);
    });
    expect(di.get('Car')).toBeDefined();
    expect(di.get('Tire')).toBeDefined();
    expect(di.get('Car').tire_).toBeDefined();
  });

  it('allows implementations to be registered in any order', function() {
    var Car, Jeep;
    given(function() {
      Car = di.service('Car', ['Tire']);
      setTestInit(Car);

      di.service('Tire');

      Jeep = di.service('Jeep', ['Tire']);
      setTestInit(Jeep);
    });

    expect(Car.instance.tire_).toBeDefined();
    expect(Jeep.instance.tire_).toBeDefined();
  });

  it('allows implementations to be overridden', function() {
    var Car, Tire, MockTire;
    given(function() {
      Tire = di.service('Tire');
      Tire.prototype.friction = 0.3;

      Car = di.service('Car', ['Tire']);
      setTestInit(Car);

      MockTire = di.service('Tire');
      MockTire.prototype.friction = 0;
    });

    expect(Car.instance.tire_.friction).toBe(0);
  });

  it('ensures dependencies are initiated first before calling init',
      function() {
    var Car, SmallTire, BigTire;
    given(function() {
      SmallTire = di.service('SmallTire');
      SmallTire.prototype.init = function() { this.friction = 0.3 };

      Car = di.service('Car', ['SmallTire', 'BigTire']);
      setTestInit(Car, function(car) {
        car.friction = (car.smallTire_.friction + car.bigTire_.friction) / 2;
      });

      BigTire = di.service('BigTire');
      BigTire.prototype.init = function() { this.friction = 0.8 };
    });

    expect(Car.instance.friction).toBe(0.55);
  });

  it('can map an implementation to a given name', function() {
    var Car, SmallTire, BigTire;
    given(function() {
      SmallTire = di.service('SmallTire');
      SmallTire.prototype.init = function() { this.friction = 0.3 };

      BigTire = di.service('BigTire');
      BigTire.prototype.init = function() { this.friction = 0.8 };

      Car = di.service('Car', ['Tire']);
      setTestInit(Car);

      di.map({Tire: 'SmallTire'});
    });

    expect(Car.instance.tire_.friction).toBe(0.3);
  });

  it('allows deps to be renamed when required', function() {
    var Car, LongServiceName;
    given(function() {
      LongServiceName = di.service('LongServiceName');
      setTestInit(LongServiceName);

      Car = di.service('Car', ['LongServiceName as lsn']);
      setTestInit(Car);
    });

    expect(Car.instance.lsn_).toBe(LongServiceName.instance);
  });

  describe('constant', function() {
    it('can be registered', function() {
      var speedLimits = {maxSpeed: 6};
      given(function() {
        di.constant('speedLimits', speedLimits);
      });
    });

    it('can be injected', function() {
      var Car, speedLimits = {maxSpeed: 6};
      given(function() {
        di.constant('speedLimits', speedLimits);

        Car = di.service('Car', ['speedLimits']);
        setTestInit(Car);
      });

      expect(Car.instance.speedLimits_).toBe(speedLimits);
    });

    it('is a singleton', function() {
      var Car, speedLimits = {maxSpeed: 6};
      given(function() {
        di.constant('speedLimits', speedLimits);

        Car = di.service('Car', ['speedLimits']);
        setTestInit(Car);
      });

      expect(Car.instance.speedLimits_.maxSpeed).toBe(6);
      speedLimits.maxSpeed = 7;
      expect(Car.instance.speedLimits_.maxSpeed).toBe(7);
    });
  });

  describe('service', function() {
    it('can be registered', function() {
      var Car;
      given(function() {
        Car = di.service('Car');
      });

      expect(Car).toBeDefined();
    });

    it('can be injected', function() {
      var Car;
      given(function() {
        di.service('Tire');

        Car = di.service('Car', ['Tire']);
        setTestInit(Car);
      });

      expect(Car.instance.tire_).toBeDefined();
    });

    it('has init called when created', function() {
      var Car;
      given(function() {
        Car = di.service('Car');
        setTestInit(Car);
      });

      expect(Car.instance).toBeDefined();
    });

    it('is a singleton', function() {
      var Car, Jeep;
      given(function() {
        di.service('Tire');

        Car = di.service('Car', ['Tire']);
        setTestInit(Car);

        Jeep = di.service('Jeep', ['Tire']);
        setTestInit(Jeep);
      });

      var carTire = Car.instance.tire_;
      var jeepTire = Car.instance.tire_;
      expect(carTire).toBe(jeepTire);
    });
  });

  describe('factory', function() {
    it('can be registered', function() {
      var Tire;
      given(function() {
        Tire = di.factory('Tire');
      });

      expect(Tire).toBeDefined();
    });

    it('can be injected', function() {
      var Car;
      given(function() {
        di.factory('Tire');

        Car = di.service('Car', ['Tire']);
        setTestInit(Car);
      });

      expect(Car.instance.tire_).toBeDefined();
    });

    it('can require other implementations', function() {
      var Car;
      given(function() {
        di.factory('Axel');

        di.factory('Tire', ['Axel']);

        Car = di.service('Car', ['Tire']);
        setTestInit(Car);
      });

      var tire = Car.instance.tire_.create();
      expect(tire.axel_).toBeDefined();
    });


    it('creates new objects via the create() method', function() {
      var Car;
      given(function() {
        di.factory('Tire');

        Car = di.service('Car', ['Tire']);
        setTestInit(Car);
      });

      expect(Car.instance.tire_.create()).toBeDefined();
    });

    it('allows arguments to be passed into create()', function() {
      var Car, Tire;
      given(function() {
        Tire = di.factory('Tire');
        setTestInit(Tire);

        Car = di.service('Car', ['Tire']);
        setTestInit(Car);
      });

      Car.instance.tire_.create('arg1', 'arg2');
      expect(Tire.instance.args).toEqual(['arg1', 'arg2']);
    });

    it('has init called when created', function() {
      var Car, Tire;
      given(function() {
        Tire = di.factory('Tire');
        setTestInit(Tire);

        Car = di.service('Car', ['Tire']);
        setTestInit(Car);
      });

      expect(Tire.instance).not.toBeDefined();
      Car.instance.tire_.create();
      expect(Tire.instance).toBeDefined();
    });

    it('is NOT a singleton', function() {
      var Car, Jeep;
      given(function() {
        di.factory('Tire');

        Car = di.service('Car', ['Tire']);
        setTestInit(Car);

        Jeep = di.service('Jeep', ['Tire']);
        setTestInit(Jeep);
      });

      var carTire = Car.instance.tire_.create();
      var jeepTire = Car.instance.tire_.create();
      expect(carTire).not.toBe(jeepTire);
    });
  });
});
