angular.module('mediaMogulApp')
  .controller('tvdbErrorsController', ['$log', '$uibModal', 'EpisodeService', 'auth',
    function($log, $uibModal, EpisodeService, auth) {
      var self = this;

      self.auth = auth;

      self.tvdbErrors = [];

      EpisodeService.updateTVDBErrors().then(function() {
        self.tvdbErrors = EpisodeService.getTVDBErrors();
      });

    }
  ]);