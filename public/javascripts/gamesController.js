angular.module('mediaMogulApp')
.controller('gamesController', ['$log', '$modal', 'GamesService',
  function($log, $modal, GamesService) {
    var self = this;

    self.steamCloud = false;
    self.manyHours = false;

    self.orderByRating = function(game) {
      return ((angular.isDefined(game.FullRating) && game.FullRating != null) ? -1: 0);
    };

    self.isCloudFiltered = function(game) {
      return !self.steamCloud || game.steam_cloud;
    };

    self.isTimeFiltered = function(game) {
      return !self.manyHours || game.aggPlaytime > 4;
    };

    self.isFinished = function(game) {
      return game.finished || game.finalscore;
    };

    self.hasValidPlatform = function(game) {
      var platform = game.platform;
      return self.platformFilters[platform];
    };

    self.gamesFilter = function(game) {
      return self.isCloudFiltered(game) &&
          self.isTimeFiltered(game) &&
        !self.isFinished(game) &&
        self.hasValidPlatform(game);
    };

    self.getButtonClass = function(uiField) {
      return uiField ? "btn btn-warning" : "btn btn-default";
    };

    var gamesList = GamesService.getGamesList();
    var platformList = GamesService.getPlatformList();
    if (gamesList.length == 0) {
      GamesService.updateGamesList().then(function () {
        self.games = GamesService.getGamesList();
        self.platforms = GamesService.getPlatformList();
        self.initPlatformFilters();
        $log.debug("Controller has " + self.games.length + " games.");
      })
    } else {
      self.games = gamesList;
      self.platforms = platformList;
    }

    self.initPlatformFilters = function () {
      self.platformFilters = [];
      self.platforms.forEach(function (platform) {
        self.platformFilters[platform] = true;
      });
    };


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