angular.module('mediaMogulApp')
.controller('gamesController', ['$log', 'GamesService',
  function($log, GamesService) {
    var self = this;

    var gamesList = GamesService.getGamesList();
    if (gamesList.length == 0) {
      GamesService.updateGamesList().then(function () {
        self.games = GamesService.getGamesList();
        $log.debug("Controller has " + self.games.length + " games.");
      })
    } else {
      self.games = gamesList;
    }
  }

  ]);