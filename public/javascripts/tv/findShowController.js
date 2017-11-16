angular.module('mediaMogulApp')
  .controller('findShowController', ['$log', 'auth', 'EpisodeService',
    function($log, auth, EpisodeService) {
      var self = this;

      self.auth = auth;

      self.selected = undefined;

      self.namesReady = false;

      EpisodeService.updateAllShowsWithBasicInfo().then(function () {
        self.shows = EpisodeService.getAllShowInfo();
        self.namesReady = true;
      });

    }
  ]);