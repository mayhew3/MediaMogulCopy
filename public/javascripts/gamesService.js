function GamesService($log, $http) {
  var games = [];

  this.updateGamesList = function() {
    return $http.get('/api/games').then(function (gamesResponse) {
      $log.debug("Games returned " + gamesResponse.data.length + " items.");
      games = gamesResponse.data;
    }, function (errResponse) {
      console.error('Error while fetching games list: ' + errResponse);
    });
  };

  this.getGamesList = function() {
    return games;
  };


  this.updateGame = function(GameId, ChangedFields) {
    $log.debug('Received update for Game ' + GameId + " with data " + JSON.stringify(ChangedFields));
    return $http.post('/api/updategame', {GameId: GameId, ChangedFields: ChangedFields});
  };

  this.updateRating = function(game) {
    var metacritic = game.metacritic;
    var myRating = game.mayhew;
    var myGuess = game.guess;

    if (myRating == null) {
      myRating = myGuess;
    }

    if (metacritic == null) {
      game.FullRating = myRating;
    } else if (myRating == null) {
      game.FullRating = metacritic;
    } else {
      var playedOverall = (game.playtime == null) ? game.timeplayed : (game.playtime / 60);
      var relevantPlaytime = playedOverall;
      if (playedOverall == null) {
        relevantPlaytime = 0;
      } else if (playedOverall > 3) {
        relevantPlaytime = 3;
      }
      game.aggPlaytime = playedOverall;

      game.myAggregate = myRating;

      var myWeight = 0.40 + (relevantPlaytime * 0.20);
      var metaWeight = 1 - myWeight;

      game.FullRating = (myRating * myWeight) + (metacritic * metaWeight);
    }
  };
}

angular.module('mediaMogulApp')
  .service('GamesService', ['$log', '$http', GamesService]);