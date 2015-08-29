angular.module('mediaMogulApp')
.controller('gameDetailController', ['$log', 'GamesService', '$modalInstance', 'game',
  function($log, GamesService, $modalInstance, game) {
    var self = this;

    self.game = game;


    self.originalFields = {
      Platform: self.game.platform,
      Owned: self.game.owned,
      Metacritic: self.game.metacritic,
      MetacriticHint: self.game.metacritic_hint,
      Mayhew: self.game.mayhew,
      TimePlayed: self.game.timeplayed,
      TimeTotal: self.game.timetotal,
      Finished: self.game.finished,
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
      Finished: self.game.finished,
      FinalScore: self.game.finalscore,
      Replay: self.game.replay
    };

    $log.debug("Game opened: " + game.game + ", Meta: " + (typeof self.interfaceFields.Metacritic));

    self.changeValues = function() {

    };

    self.ok = function() {
      $modalInstance.close();
    }
  }
  ]);