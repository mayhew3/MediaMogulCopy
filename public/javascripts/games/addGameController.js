angular.module('mediaMogulApp')
  .controller('addGameController', ['$log', 'GamesService', '$uibModalInstance', 'auth',
    function($log, GamesService, $uibModalInstance, auth) {
      var self = this;

      self.auth = auth;

      self.game = {
        owned: 'owned'
      };

      self.gameExists = false;

      self.updateGameExists = function() {
        var title = self.game.title;
        var platform = self.game.platform;
        self.gameExists = !!GamesService.getGameWithTitleAndPlatform(title, platform);
      };


      self.ok = function() {
        self.game.date_added = new Date;
        var errorResponse = GamesService.addGame(self.game);
        if (errorResponse) {
          $log.debug("Error adding Game. Response: " + errorResponse);
        } else {
          $uibModalInstance.close();
        }
      };

      self.cancel = function() {
        $uibModalInstance.close();
      }
    }]);