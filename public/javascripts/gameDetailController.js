angular.module('mediaMogulApp')
.controller('gameDetailController', ['$log', 'GamesService', '$modalInstance', 'game',
  function($log, GamesService, $modalInstance, game) {
    var self = this;

    self.game = game;

    self.originalFields = {
      platform: self.game.platform,
      owned: self.game.owned,
      metacritic: self.game.metacritic,
      metacritic_hint: self.game.metacritic_hint,
      guess: self.game.guess,
      mayhew: self.game.mayhew,
      timeplayed: self.game.timeplayed,
      timetotal: self.game.timetotal,
      finalscore: self.game.finalscore,
      replay: self.game.replay
    };

    self.interfaceFields = {
      platform: self.game.platform,
      owned: self.game.owned,
      metacritic: self.game.metacritic,
      metacritic_hint: self.game.metacritic_hint,
      guess: self.game.guess,
      mayhew: self.game.mayhew,
      timeplayed: self.game.timeplayed,
      timetotal: self.game.timetotal,
      finalscore: self.game.finalscore,
      replay: self.game.replay
    };

    $log.debug("Game opened: " + game.title + ", Finished: " + self.game.finished);

    self.changeValues = function() {

      var changedFields = {};
      for (var key in self.interfaceFields) {
        if (self.interfaceFields.hasOwnProperty(key)) {
          var value = self.interfaceFields[key];

          $log.debug("In loop, key: " + key + ", value: " + value + ", old value: " + self.originalFields[key]);

          if (value != self.originalFields[key]) {
            $log.debug("Changed detected... ");
            changedFields[key] = value;
          }
        }
      }

      $log.debug("Changed fields: " + JSON.stringify(changedFields));

      if (Object.getOwnPropertyNames(changedFields).length > 0) {
        $log.debug("Changed fields has a length!");

        GamesService.updateGame(game.id, changedFields).then(function() {
          // todo: loop?
          self.game.platform = self.interfaceFields.platform;
          self.game.owned = self.interfaceFields.owned;
          self.game.metacritic = self.interfaceFields.metacritic;
          self.game.metacritic_hint = self.interfaceFields.metacritic_hint;
          self.game.guess = self.interfaceFields.guess;
          self.game.mayhew = self.interfaceFields.mayhew;
          self.game.timeplayed = self.interfaceFields.timeplayed;
          self.game.timetotal = self.interfaceFields.timetotal;
          self.game.finalscore = self.interfaceFields.finalscore;
          self.game.replay = self.interfaceFields.replay;

          self.originalFields.platform = self.interfaceFields.platform;
          self.originalFields.owned = self.interfaceFields.owned;
          self.originalFields.metacritic = self.interfaceFields.metacritic;
          self.originalFields.metacritic_hint = self.interfaceFields.metacritic_hint;
          self.originalFields.guess = self.interfaceFields.guess;
          self.originalFields.mayhew = self.interfaceFields.mayhew;
          self.originalFields.timeplayed = self.interfaceFields.timeplayed;
          self.originalFields.timetotal = self.interfaceFields.timetotal;
          self.originalFields.finalscore = self.interfaceFields.finalscore;
          self.originalFields.replay = self.interfaceFields.replay;

          GamesService.updateRating(game);

          $log.debug("Finished resetting. Original values: " + self.originalFields);
        });
      }
    };

    self.ok = function() {
      $modalInstance.close();
    }
  }
  ]);