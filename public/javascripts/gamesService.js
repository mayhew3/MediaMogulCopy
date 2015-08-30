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
}

angular.module('mediaMogulApp')
  .service('GamesService', ['$log', '$http', GamesService]);