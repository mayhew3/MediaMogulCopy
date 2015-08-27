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
  }
}

angular.module('mediaMogulApp')
  .service('GamesService', ['$log', '$http', GamesService]);