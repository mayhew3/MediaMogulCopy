angular.module('mediaMogulApp')
.controller('addPlaytimeController', ['$log', 'GamesService', '$uibModalInstance', 'game', 'auth',
  function($log, GamesService, $uibModalInstance, game, auth) {
    var self = this;

    self.auth = auth;

    self.game = game;

    // DATE HANDLING
    var options = {
      year: "numeric", month: "2-digit",
      day: "2-digit", timeZone: "America/Los_Angeles"
    };

    function formatDate(unformattedDate) {
      var originalDate = (unformattedDate === '' || unformattedDate === null) ? null :
        new Date(unformattedDate);
      if (originalDate !== null) {
        originalDate.setHours(0, 0, 0, 0);
      }
      return originalDate;
    }

    function dateHasChanged(originalValue, updatedValue) {
      var originalDate = formatDate(originalValue);
      var updatedDate = formatDate(updatedValue);

      if (updatedDate === null && originalDate === null) {
        return false;
      } else if (updatedDate === null) {
        return true;
      } else if (originalDate === null) {
        return true;
      } else {
        return updatedDate.getTime() !== originalDate.getTime();
      }
    }

    // FIELDS

    self.original_hours = null;
    self.original_minutes = null;
    self.new_hours = null;
    self.new_minutes = null;
    self.added_hours = null;
    self.added_minutes = null;
    self.session_rating = null;
    self.finished = false;


    self.originalFields = {
      timeplayed: self.game.timeplayed,
      timetotal: self.game.timetotal,
      finalscore: self.game.finalscore,
      replay: self.game.replay,
      finished: self.game.finished === null ? null : new Date(self.game.finished).toLocaleDateString("en-US", options)
    };

    self.interfaceFields = {
      timeplayed: self.game.timeplayed,
      timetotal: self.game.timetotal,
      finalscore: self.game.finalscore,
      replay: self.game.replay,
      finished: self.game.finished === null ? null : new Date(self.game.finished).toLocaleDateString("en-US", options)
    };

    $log.debug("Game opened: " + game.title + ", Finished: " + self.game.finished);

    self.changeValues = function() {

      if (!dateHasChanged(self.originalFields.finished, self.interfaceFields.finished)) {
        self.interfaceFields.finished = self.originalFields.finished;
      }

      var changedFields = {};
      for (var key in self.interfaceFields) {
        if (self.interfaceFields.hasOwnProperty(key)) {
          var value = self.interfaceFields[key];

          $log.debug("In loop, key: " + key + ", value: " + value + ", old value: " + self.originalFields[key]);

          if (value !== self.originalFields[key]) {
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
          self.game.timeplayed = self.interfaceFields.timeplayed;
          self.game.timetotal = self.interfaceFields.timetotal;
          self.game.finalscore = self.interfaceFields.finalscore;
          self.game.replay = self.interfaceFields.replay;

          self.originalFields.timeplayed = self.interfaceFields.timeplayed;
          self.originalFields.timetotal = self.interfaceFields.timetotal;
          self.originalFields.finalscore = self.interfaceFields.finalscore;
          self.originalFields.replay = self.interfaceFields.replay;

          GamesService.updatePlaytimes(game);
          GamesService.updateRating(game);

          $log.debug("Finished resetting. Original values: " + self.originalFields);
        });
      }

      $uibModalInstance.close();
    };


    self.openAddPlaytime = function(game) {
      $uibModal.open({
        templateUrl: 'views/games/addPlaytime.html',
        controller: 'addPlaytimeController as ctrl',
        size: 'lg',
        resolve: {
          game: function() {
            return game;
          }
        }
      });
    };


    self.cancel = function() {
      $uibModalInstance.dismiss();
    }

  }
  ]);