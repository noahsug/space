describe('A game', function() {
  initTestEnvironment(this);
  var game, gm, r, shipFactory, gameplay, renderer, screen;
  var watch, items;

  beforeEach(function() {
    inject(function() {
      mock.mock('GameRunner');
    });
    game = di.get('Game');
    r = di.get('Random');
    gm = di.get('GameModel');
    gameplay = di.get('Gameplay');
    renderer = di.get('Renderer');
    screen = di.get('Screen');
    shipFactory = di.get('ShipFactory');
    watch = false;

    items = [];
    _.each(Game.ITEM_TYPES, function(type) {
      items.push(_.pluck(
        _.where(gameplay.items, {category: type}),
        'name'));
    });
  });

  it('watch', function() {
    screen.setSurfaceArea(Screen.DESIRED_SURFACE_AREA);
    document.getElementById('hide-canvas').style.display = "";
    var seed = 2006309135.2142427;
    var spec1 = ["shotgun", "charge", "reflect II", "scope II"];
    var spec2 = ["shotgun II"];

    r.seed(seed);
    watch = true;
    battle(spec1, spec2);
  });

  xit('analyze', function() {
    // TODO: Make both players have same health (not 40 vs 30).
    var data = gatherData(15000);
    analyzeItems(data);
    analyzeReplays(data);
  });

  function analyzeReplays(data) {
    console.log('\nShorest replays:');
    var replayData = _.sortBy(data.misc, function(replayData) {
      return replayData.result.duration;
    });
    _.each(replayData.slice(0, 10), function(replayData, i) {
      console.log(i + ')',
                  replayData.result.duration, replayData.result.seed,
                  replayData.spec1, replayData.spec2);
    });
  };

  function analyzeItems(data) {
    console.log('\nItems:');
    _.each(items, function(names, i) {
      var stats = getStats(data.data, i);
      console.log('-----', i, '-----');
      _.each(stats, function(stat, rank) {
        console.log(rank + ')', stat);
      });
    });
  }

  function getStats(data, i) {
    var stats = [];
    _.each(data, function(sample) {
      var record = stats[sample[i]] = stats[sample[i]] ||
          {name: items[i][sample[i]], level: 0, actualLevel: 'N/A',
           ratio: 0, wins: 0, losses: 0};
      var won = sample[sample.length - 1];
      record.wins += won;
      record.losses += !won;
      record.ratio = record.wins / record.losses;
      record.level = Math.round(record.ratio / .4);
      if (record.name) record.actualLevel = gameplay.items[record.name].level;
    });
    return _.sortBy(stats, function(stat) {
      return -stat.ratio;
    });
  };

  function gatherData(numSamples) {
    var data = new Array(numSamples * 2);
    var misc = [];
    screen.setSurfaceArea(Screen.DESIRED_SURFACE_AREA);
    for (var i = 0; i < numSamples; i++) {
      var spec1 = getRandomSpec();
      var spec2 = getRandomSpec();
      var result = battle(spec1.names, spec2.names);
      if (i % 10 == 0) console.log(i);
      data[i * 2] = spec1.id.concat(spec2.id).concat(result.r);
      data[i * 2 + 1] = spec2.id.concat(spec1.id).concat(!result.r);
      misc.push({spec1: spec1.names, spec2: spec2.names, result: result});

      continue;
      if (result.r) {
        r.seed(result.seed);
        watch = true;
      } else {
        watch = false;
      }
    }
    return {data: data, misc: misc};
  };

  function getRandomSpec() {
    var id = new Array(items.length);
    var names = _.newList(items, function(names, i) {
      var itemInfo = pickRandomItem(names, i == 0);
      id[i] = itemInfo.index;
      return itemInfo.item || undefined;
    });
    return {names: names, id: id};
  };

  function pickRandomItem(names, required) {
    var len = names.length + !required;  // Ensure primary weapon is included.
    var index = Math.floor(Math.random() * len);
    return {
      index: index,
      item: names[index]
    };
  };

  function battle(spec1, spec2) {
    gm.init();
    game.nextAction_ = 0;
    var ship1 = createShip(spec1, 'good');
    var ship2 = createShip(spec2, 'bad');
    ship1.setMaxHealth(50);
    ship2.setMaxHealth(50);
    shipFactory.setTargets(ship1, ship2);
    var seed = r.getSeed();

    var i;
    for (i = 0; i < 1500; i++) {
      game.updateEntities_(Game.UPDATE_RATE);
      if (watch) {
        renderer.update(Game.UPDATE_RATE);
        debugger;
      }
      ship1 = ship1.getLivingClone();
      ship2 = ship2.getLivingClone();
      if (ship1.dead || ship2.dead) break;
    }
    return {
      r: ship1.dead ? 0 : 1,
      seed: seed,
      duration: i * Game.UPDATE_RATE
    };
  };

  function createShip(spec, style) {
    var items = new Array(spec.length);
    for (var i = 0; i < spec.length; i++) {
      var name = spec[i];
      items[i] = gameplay.items[name];
    }
    return shipFactory.createShip(items, style);
  };
});
