describe('A world', function() {
  initTestEnvironment(this);
  var gm, world;

  beforeEach(function() {
    world = di.get('World');
    gm = di.get('GameModel');
    di.get('Game').initGameModel_();
    gm.world = _.last(gm.worlds);
  });

  function expectUnlocked(var_unlockedRowCol) {
    var unlocked = _.map(arguments, function(rowCol) {
      return rowCol[0] * gm.world.cols + rowCol[1];
    });
    gm.world.levels.forEach(function(level) {
      if (_.contains(unlocked, level.index)) {
        expect(level.state).toBe('unlocked');
      } else {
        expect(level.state).toBe('locked');
      }
    });
  };

  it('can be created', function() {
    world.create(gm.world);
    expect(gm.world.levels.length).toBe(gm.world.rows * gm.world.cols);
  });

  it('can get a level by (row, col)', function() {
    world.create(gm.world);
    expect(world.get(2, 3).index).toBe(2 * gm.world.cols + 3);
  });

  it('all levels but the first are initially locked', function() {
    world.create(gm.world);
    expectUnlocked([0, 0]);
  });

  // Ensure world is 6x3 for this test to pass.
  it('can unlock adjacent levels', function() {
    world.create(gm.world);

    world.unlockAdjacent(world.get(0, 0));
    expectUnlocked(World.START,
                   [0, 1], [1, 0]);

    world.unlockAdjacent(world.get(3, 1));
    expectUnlocked(World.START,
                   [0, 1], [1, 0],
                   [3, 0], [3, 2], [2, 1], [4, 1]);

    world.unlockAdjacent(world.get(4, 2));
    expectUnlocked(World.START,
                   [0, 1], [1, 0],
                   [3, 0], [3, 2], [2, 1], [4, 1],
                   [5, 2]);
  });

  it('can detect when the game is won', function() {
    world.create(gm.world);
    expect(world.won()).toBe(false);
    world.get.apply(world, world.end()).state = 'won';
    expect(world.won()).toBe(true);
  });

  it('can detect when the game is lost', function() {
    world.create(gm.world);
    expect(world.lost()).toBe(false);

    //for (var col = 0; col < gm.world.cols; col++) {
    //  world.get(1, col).state = 'lost';
    //}
    //expect(world.lost()).toBe(true);
  });
});
