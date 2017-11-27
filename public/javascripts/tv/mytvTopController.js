angular.module('mediaMogulApp')
  .controller('mytvTopController', ['auth', 'EpisodeService',
    function(auth, EpisodeService) {
      var self = this;

      self.auth = auth;
      if (self.auth.isAdmin()) {
        EpisodeService.updateNumberOfPendingMatches();
      }

      this.getNumberOfPendingMatches = function() {
        return EpisodeService.getNumberOfPendingMatches();
      }

    }
  ]);