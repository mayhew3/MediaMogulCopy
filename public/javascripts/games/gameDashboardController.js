angular.module('mediaMogulApp')
  .controller('gameDashboardController', ['$log', '$modal', 'GamesService',
    function($log, $modal, GamesService) {
      var self = this;

      self.platforms = ["Wii U", "Xbox One", "PS4", "Steam", "PC"];

      self.orderByRating = function(game) {
        return ((angular.isDefined(game.FullRating) && game.FullRating !== null) ? -1: 0);
      };

      self.orderByLastPlayed = function(game) {
        return ((angular.isDefined(game.last_played) && game.last_played !== null) ? -1: 0);
      };

      self.getDateFormat = function(date) {
        var thisYear = (new Date).getFullYear();

        if (date !== null) {
          var year = new Date(date).getFullYear();

          if (year === thisYear) {
            return 'EEE M/d';
          } else {
            return 'yyyy.M.d';
          }
        }
        return 'yyyy.M.d';
      };

      self.isFinished = function(game) {
        return game.finished || game.finalscore;
      };

      self.baseFilter = function(game) {
        var platform = game.platform;
        return !self.isFinished(game) &&
            contains(self.platforms, platform);
      };

      self.newlyAddedFilter = function(game) {
        return addedInLastXDays(game.date_added, 90) &&
          game.aggPlaytime < 0.1 &&
          self.baseFilter(game);
      };

      self.lastPlayedFilter = function(game) {
        return self.baseFilter(game);
      };


      function addedInLastXDays(dateAdded, days) {
        var notNull = dateAdded !== null;
        var diff = (new Date(dateAdded) - new Date + (1000 * 60 * 60 * 24 * days));
        var withinDiff = (diff > 0);

        //$log.debug("AirDate: " + dateAdded + ", diff: " + diff);

        return notNull && withinDiff;
      }


      var gamesList = GamesService.getGamesList();
      if (gamesList.length === 0) {
        GamesService.updateGamesList().then(function () {
          self.games = GamesService.getGamesList();
          $log.debug("Controller has " + self.games.length + " games.");
        })
      } else {
        self.games = gamesList;
      }

      function contains(myArray, myValue) {
        return myArray.some(function (g1) {
          return g1 === myValue;
        });
      }

      self.open = function(game) {
        $modal.open({
          templateUrl: 'views/games/gameDetail.html',
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
          templateUrl: 'views/games/addGame.html',
          controller: 'addGameController as ctrl',
          size: 'lg',
          resolve: {
          }
        });
      };
    }

  ]);