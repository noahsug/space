describe('DI validator', function() {
  initTestEnvironment(this);

  beforeEach(function() {
    di = new Di();
  });

  it('checks if a dependency is not an array', function() {
    expect(di.service.bind(di, 'Car', 'Tire')).toThrow();
  });

  it('checks if a dependency does not exist', function() {
    di.service('Car', ['Tire']);
    expect(di.init.bind(di)).toThrow();
  });

  it('checks for circular dependencies', function() {
    di.service('Car', ['Tire']);
    di.service('Tire', ['Axle']);
    di.service('Axle', ['Car']);
    expect(di.init.bind(di)).toThrow();
  });

  it('checks invalid mappings', function() {
    di.map({Car: 'Invalid'});
    expect(di.init.bind(di)).toThrow();
  });
});
