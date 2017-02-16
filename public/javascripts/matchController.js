angular.module('mediaMogulApp')
  .controller('matchController', ['$log', '$modal', 'EpisodeService', 'auth',
    function($log, $modal, EpisodeService, auth) {
      var self = this;

      self.auth = auth;

      self.selectedPill = "Needs First Pass";

      self.isActive = function(pillName) {
        return (pillName == self.selectedPill) ? "active" : null;
      };

      self.needsFirstPassFilter = function(series) {
        return series.tvdb_match_status === 'Needs First Pass';
      };

      self.refreshSeriesList = function() {
        EpisodeService.updateSeriesList().then(function () {
          self.series = EpisodeService.getSeriesList();
          $log.debug("Controller has " + self.series.length + " shows.");
        });
      };
      self.refreshSeriesList();

    }
  ]);