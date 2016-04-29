angular.module('mediaMogulApp')
  .controller('addGameController', ['$log', 'GamesService', '$modalInstance',
    function($log, GamesService, $modalInstance) {
      var self = this;

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
          $modalInstance.close();
        }
      };

      self.cancel = function() {
        $modalInstance.close();
      }
    }]);