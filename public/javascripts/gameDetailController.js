angular.module('mediaMogulApp')
.controller('gameDetailController', ['$log', 'GamesService', '$modalInstance', 'game',
  function($log, GamesService, $modalInstance, game) {
    var self = this;

    self.game = game;

    if (game.logo == null || game.logo == '') {
      game.imageUrl = "images/trans.gif";
    } else {
      game.imageUrl = "http://media.steampowered.com/steamcommunity/public/images/apps/" + game.steamid + "/" + game.logo + ".jpg";
    }

    self.originalFields = {
      Platform: self.game.platform,
      Owned: self.game.owned,
      Metacritic: self.game.metacritic,
      MetacriticHint: self.game.metacritic_hint,
      Mayhew: self.game.mayhew,
      TimePlayed: self.game.timeplayed,
      TimeTotal: self.game.timetotal,
      FinalScore: self.game.finalscore,
      Replay: self.game.replay
    };

    self.interfaceFields = {
      Platform: self.game.platform,
      Owned: self.game.owned,
      Metacritic: self.game.metacritic,
      MetacriticHint: self.game.metacritic_hint,
      Mayhew: self.game.mayhew,
      TimePlayed: self.game.timeplayed,
      TimeTotal: self.game.timetotal,
      FinalScore: self.game.finalscore,
      Replay: self.game.replay
    };

    $log.debug("Game opened: " + game.game + ", Finished: " + self.game.finished);

    self.changeValues = function() {
      self.game.platform = self.interfaceFields.Platform;
      self.game.owned = self.interfaceFields.Owned;
      self.game.metacritic = self.interfaceFields.Metacritic;
      self.game.metacritic_hint = self.interfaceFields.MetacriticHint;
      self.game.mayhew = self.interfaceFields.Mayhew;
      self.game.timeplayed = self.interfaceFields.TimePlayed;
      self.game.timetotal = self.interfaceFields.TimeTotal;
      self.game.finalscore = self.interfaceFields.FinalScore;
      self.game.replay = self.interfaceFields.Replay;
    };

    self.ok = function() {
      $modalInstance.close();
    }
  }
  ]);