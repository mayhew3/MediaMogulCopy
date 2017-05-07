angular.module('mediaMogulApp')
  .controller('tvdbErrorsController', ['$log', '$modal', 'EpisodeService', 'auth',
    function($log, $modal, EpisodeService, auth) {
      var self = this;

      self.auth = auth;

      self.tvdbErrors = [];

      EpisodeService.updateTVDBErrors().then(function() {
        self.tvdbErrors = EpisodeService.getTVDBErrors();
      });

    }
  ]);