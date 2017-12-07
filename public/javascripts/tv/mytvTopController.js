angular.module('mediaMogulApp')
  .controller('mytvTopController', ['auth', 'EpisodeService',
    function(auth, EpisodeService) {
      var self = this;

      self.auth = auth;
      self.year = 2017;

      if (self.auth.isAdmin()) {
        EpisodeService.updateNumberOfShowsToRate(self.year);
        EpisodeService.updateNumberOfPendingMatches();
      }

      this.getNumberOfShowsToRate = function() {
        return EpisodeService.getNumberOfShowsToRate();
      };

      this.getNumberOfPendingMatches = function() {
        return EpisodeService.getNumberOfPendingMatches();
      };

    }
  ]);