angular.module('mediaMogulApp')
.controller('gamesController', ['$log', 'GamesService',
  function($log, GamesService) {
    var self = this;

    var gamesList = GamesService.getGamesList();
    if (gamesList.length == 0) {
      GamesService.updateGamesList().then(function () {
        self.games = GamesService.getGamesList();
        $log.debug("Controller has " + self.games.length + " games.");

        self.games.forEach(function (game) {
          if (game.logo == null || game.logo == '') {
            game.imageUrl = "images/trans.gif";
          } else {
            game.imageUrl = "http://media.steampowered.com/steamcommunity/public/images/apps/" + game.steamid + "/" + game.logo + ".jpg";
          }
        });
      })
    } else {
      self.games = gamesList;
    }
  }

  ]);