xdescribe('A game', function() {
  initTestEnvironment(this);
  var game, gm, r;

  beforeEach(function() {
    inject(function() {
      mock.mock('GameRunner');
    });
    game = di.get('Game');
    r = di.get('Random');
    gm = di.get('GameModel');
  });

  it('can have its results analyzed for different random seeds', function() {
    var playerWon = 0;
    var enemyWon = 0;
    var tie = 0;
    var bestSeed = 0;
    var longestGame = 0;
    var worstSeed = 0;
    var shortestGame = 1000000;
    for (var i = 0; i < 1; i++) {
      var gameOver = false;
      var gameLength = 0;
      var seed = r.seed(i / 10);
      gm.init();
      game.start();
      var updateTime = Game.UPDATE_RATE;

      while (!gameOver) {
        game.update(updateTime);
        gameLength += updateTime;
        gameOver = gm.entities['player'].dead || gm.entities['enemy'].dead;
        if (gameOver) {
          var pWin = gm.entities['player'].dead;
          var eWin = gm.entities['enemy'].dead;
          if (pWin && eWin) tie++;
          else if (pWin) playerWon++;
          else enemyWon++;

          console.log('seed:', seed, 'length:', gameLength);
          if (gameLength > longestGame) {
            bestSeed = seed;
            longestGame = gameLength;
          }
          if (gameLength < shortestGame) {
            worstSeed = seed;
            shortestGame = gameLength;
          }
        }
      }
    }
    console.log('best seed:', bestSeed, 'best length:', longestGame);
    console.log('worst seed:', worstSeed, 'shortest length:', shortestGame);
    console.log('player:', playerWon, 'enemy:', enemyWon, 'tie:', tie);
  });
});
