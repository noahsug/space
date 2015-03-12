describe('A world', function() {
  initTestEnvironment(this);
  var gm, world;

  beforeEach(function() {
    world = di.get('World');
    gm = di.get('GameModel');
  });

  function expectUnlocked(var_unlockedRowCol) {
    var unlocked = _.map(arguments, function(rowCol) {
      return rowCol[0] * World.COLS + rowCol[1];
    });
    gm.world.forEach(function(level) {
      if (!level.locked != _.contains(unlocked, level.index)) {
        console.error(level.index, level.locked, unlocked);
      }
      expect(level.locked).toBe(!_.contains(unlocked, level.index));
    });
  };

  it('can be created', function() {
    expect(gm.world.length).toBe(0);
    world.create();
    expect(gm.world.length).toBe(World.LEVELS);
  });

  it('can get a level by (row, col)', function() {
    world.create();
    expect(world.get(2, 3).index).toBe(2 * World.COLS + 3);
  });

  it('all levels but the first are initially locked', function() {
    world.create();
    expectUnlocked(World.START);
  });

  // Ensure world is 6x3 for this test to pass.
  it('can unlock adjacent levels', function() {
    world.create();

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
    world.create();
    expect(world.won()).toBe(false);
    world.get.apply(world, World.END).results = 'won';
    expect(world.won()).toBe(true);
  });

  it('can detect when the game is lost', function() {
    world.create();
    expect(world.lost()).toBe(false);

    //for (var col = 0; col < World.COLS; col++) {
    //  world.get(1, col).results = 'lost';
    //}
    //expect(world.lost()).toBe(true);
  });
});
