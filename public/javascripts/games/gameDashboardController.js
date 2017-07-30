angular.module('mediaMogulApp')
  .controller('gameDashboardController', ['$log', '$modal', 'GamesService',
    function($log, $modal, GamesService) {
      var self = this;

      var MAX_GAMES = 6;

      self.platforms = ["Wii U", "Xbox One", "PS4", "Steam", "PC"];
      self.games = [];

      self.recentGames = [];
      self.newlyAddedGames = [];
      self.almostDoneGames = [];
      self.playAgainGames = [];


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

      // ALMOST DONE SHOWCASE

      self.createAlmostDoneShowcase = function() {
        var filtered = _.filter(self.games, self.almostDoneFilter);
        var sorted = _.sortBy(filtered, function(game) {
          return self.almostDoneScore(game) * -1;
        });

        self.almostDoneGames = _.first(sorted, MAX_GAMES);
        self.games = _.without(self.games, self.almostDoneGames);
      };

      self.almostDoneFilter = function(game) {
        return game.aggPlaytime > 2 &&
          self.baseFilter(game);
      };

      self.almostDoneScore = function(game) {
        var timeLeft = game.aggTimetotal - game.aggPlaytime;
        if (timeLeft > 0) {
          return (timeLeft > 95) ? 0 : (95 - timeLeft);
        } else {
          // Use a function with a horizontal asymptote so we can order games with negative playtime with no limit.
          // The bigger the negative number, the closer the result of this function will get to 5. 0 will return 0.
          // (4x^2 - 10) / (x^2 + 10) + 1
          var SLOPE_SCALE = 10;
          var timeOverSquared = Math.pow(timeLeft, 2);
          var under5Value = ((4 * timeOverSquared) - SLOPE_SCALE) / (timeOverSquared + SLOPE_SCALE) + 1;
          $log.debug(game.title + " has negative time left: " + timeLeft + ". Under 5 score: " + under5Value);
          return 95 + under5Value;
        }
      };


      // PLAY AGAIN SHOWCASE

      self.createPlayAgainShowcase = function() {
        var filtered = _.filter(self.games, self.playAgainFilter);
        var sorted = _.sortBy(filtered, function(game) {
          return self.playAgainScore(game) * -1;
        });

        self.playAgainGames = _.first(sorted, MAX_GAMES);
        self.games = _.without(self.games, self.playAgainGames);
      };

      self.playAgainFilter = function(game) {
        return game.finished !== null;
      };

      self.playAgainScore = function(game) {
        return game.replay;
      };

      // SETUP ALL GAME LISTS

      self.createShowcases = function() {
        self.createRecentlyPlayedShowcase();
        self.createNewlyAddedShowcase();
        self.createAlmostDoneShowcase();
        self.createPlayAgainShowcase();
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