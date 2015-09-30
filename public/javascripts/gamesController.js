angular.module('mediaMogulApp')
.controller('gamesController', ['$log', '$modal', 'GamesService',
  function($log, $modal, GamesService) {
    var self = this;

    self.steamCloud = false;

    self.orderByRating = function(game) {
      return (angular.isDefined(game.FullRating) ? -1: 0);
    };

    self.isCloudFiltered = function(game) {
      return !self.steamCloud || game.steam_cloud;
    };

    self.isFinished = function(game) {
      return game.finished || game.finalscore;
    };



    self.gamesFilter = function(game) {
      return self.isCloudFiltered(game) && !self.isFinished(game);
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