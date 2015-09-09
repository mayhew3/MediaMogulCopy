angular.module('mediaMogulApp')
.controller('gamesController', ['$log', '$modal', 'GamesService',
  function($log, $modal, GamesService) {
    var self = this;

    self.orderByRating = function(game) {
      return (angular.isDefined(game.FullRating) ? -1: 0);
    };


    self.gamesFilter = function(game) {
      return !game.finished && !game.finalscore;
    };


    var gamesList = GamesService.getGamesList();
    if (gamesList.length == 0) {
      GamesService.updateGamesList().then(function () {
        self.games = GamesService.getGamesList();
        $log.debug("Controller has " + self.games.length + " games.");
      })
    } else {
      self.games = gamesList;
    }


    self.open = function(game) {
      $modal.open({
        templateUrl: 'views/gameDetail.html',
        controller: 'gameDetailController as ctrl',
        size: 'lg',
        resolve: {
          game: function() {
            return game;
          }
        }
      });
    };

    self.addGame = function() {
      $log.debug("Adding window.");
      $modal.open({
        templateUrl: 'views/addGame.html',
        controller: 'addGameController as ctrl',
        size: 'lg',
        resolve: {

        }
      });
    };
  }

  ]);