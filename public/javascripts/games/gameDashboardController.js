angular.module('mediaMogulApp')
  .controller('gameDashboardController', ['$log', '$modal', 'GamesService',
    function($log, $modal, GamesService) {
      var self = this;

      var MAX_GAMES = 6;

      self.platforms = ["Wii U", "Xbox One", "PS4", "Steam", "PC"];
      self.games = [];

      self.recentGames = [];
      self.newlyAddedGames = [];


      // UI HELPERS

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


      // FILTER HELPERS

      self.isFinished = function(game) {
        return game.finished || game.finalscore;
      };

      self.baseFilter = function(game) {
        var platform = game.platform;
        return !self.isFinished(game) &&
          _.contains(self.platforms, platform);
      };

      function daysBetween(earlyDate, lateDate) {
        return (lateDate - earlyDate) / (1000 * 60 * 60 * 24 );
      }



      // RECENTLY PLAYED SHOWCASE

      self.createRecentlyPlayedShowcase = function() {
        var filtered = _.filter(self.games, self.recentlyPlayedFilter);
        var sorted = _.sortBy(filtered, function(game)  {
          return self.recentlyPlayedScore(game) * -1;
        });

        self.recentGames = _.first(sorted, MAX_GAMES);
        self.games = _.without(self.games, self.recentGames);
      };

      self.recentlyPlayedScore = function(game) {
        if (game.last_played === null) {
          return -1;
        }
        var today = new Date;
        var daysAgo = daysBetween(game.last_played, today);
        return (daysAgo > 100) ? 0 : (100 - daysAgo);
      };

      self.recentlyPlayedFilter = function(game) {
        return self.baseFilter(game) && game.last_played !== null;
      };


      // NEWLY ADDED SHOWCASE

      self.createNewlyAddedShowcase = function() {
        var filtered = _.filter(self.games, self.newlyAddedFilter);
        var sorted = _.sortBy(filtered, function(game) {
          return self.newlyAddedScore(game) * -1;
        });

        self.newlyAddedGames = _.first(sorted, MAX_GAMES);
        self.games = _.without(self.games, self.newlyAddedGames);
      };

      self.newlyAddedScore = function(game) {
        if (game.date_added === null) {
          return -1;
        }
        var today = new Date;
        var added = new Date(game.date_added);
        var daysAgo = daysBetween(added, today);
        return (daysAgo > 100) ? 0 : (100 - daysAgo);
      };

      self.newlyAddedFilter = function(game) {
        return game.date_added !== null &&
          game.aggPlaytime < 0.1 &&
          self.baseFilter(game);
      };


      // SETUP ALL GAME LISTS

      self.createShowcases = function() {
        self.createRecentlyPlayedShowcase();
        self.createNewlyAddedShowcase();
      };

      var gamesList = GamesService.getGamesList();
      if (gamesList.length === 0) {
        GamesService.updateGamesList().then(function () {
          self.games = GamesService.getGamesList().slice();
          $log.debug("Controller has " + self.games.length + " games.");
          self.createShowcases();
        })
      } else {
        self.games = gamesList.slice();
        self.createShowcases();
      }


      // UI POPUPS

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

    }

  ]);