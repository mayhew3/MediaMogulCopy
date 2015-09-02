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

        self.games.forEach(function (game) {
          updateNumericFields(game);
          if (game.logo == null || game.logo == '') {
            game.imageUrl = null;
          } else {
            game.imageUrl = "http://media.steampowered.com/steamcommunity/public/images/apps/" + game.steamid + "/" + game.logo + ".jpg";
          }
          GamesService.updateRating(game);
        });
      })
    } else {
      self.games = gamesList;
    }

    function updateNumericFields(game) {
      if (game.metacritic != null) {
        game.metacritic = parseFloat(game.metacritic);
      }
      if (game.mayhew != null) {
        game.mayhew = parseFloat(game.mayhew);
      }
      if (game.timeplayed != null) {
        game.timeplayed = parseFloat(game.timeplayed);
      }
      if (game.timetotal != null) {
        game.timetotal = parseFloat(game.timetotal);
      }
      if (game.replay != null) {
        game.replay = parseFloat(game.replay);
      }
      if (game.finalscore != null) {
        game.finalscore = parseFloat(game.finalscore);
      }
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

  }

  ]);