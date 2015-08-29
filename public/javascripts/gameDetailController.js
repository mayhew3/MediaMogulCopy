angular.module('mediaMogulApp')
.controller('gameDetailController', ['$log', 'GamesService', '$modalInstance', 'game',
  function($log, GamesService, $modalInstance, game) {
    var self = this;

    self.game = game;


    self.originalFields = {
      Metacritic: self.game.metacritic
    };

    self.interfaceFields = {
      Metacritic: self.game.metacritic
    };

    $log.debug("Game opened: " + game.game + ", Meta: " + (typeof self.interfaceFields.Metacritic));

    self.changeValues = function() {

    };

    self.ok = function() {
      $modalInstance.close();
    }
  }
  ]);