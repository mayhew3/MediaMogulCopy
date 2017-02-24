angular.module('mediaMogulApp')
  .controller('matchConfirmationController', ['$log', 'EpisodeService', '$modalInstance', 'series', '$modal', '$filter', 'auth',
    function($log, EpisodeService, $modalInstance, series, $modal, $filter, auth) {
      var self = this;

      self.auth = auth;

      self.series = series;
      self.possibleMatches = [];

      self.selectedMatch = null;

      EpisodeService.updatePossibleMatches(self.series).then(function() {
        self.possibleMatches = EpisodeService.getPossibleMatches();
        $log.debug("Updated " + self.possibleMatches.length + " possible matches.");

        self.possibleMatches.forEach(function (match) {
          if (series.tvdb_match_id == match.tvdb_series_ext_id) {
            self.selectedMatch = match;
          }
        });
      });


      self.posterStyle = function(match) {
        if (match == self.selectedMatch) {
          return {"border": "solid limegreen"};
        } else {
          return {"border": "solid gray"};
        }
      };

      self.selectMatch = function(match) {
        self.selectedMatch = match;
      };


      self.ok = function() {
        if (self.selectedMatch.tvdb_series_ext_id != series.tvdb_match_id) {
          var changedFields = {
            tvdb_match_id: self.selectedMatch.tvdb_series_ext_id
          };
          EpisodeService.updateSeries(series.id, changedFields).then(function() {
            series.tvdb_match_id = self.selectedMatch.tvdb_series_ext_id;
            series.tvdb_series_title = self.selectedMatch.tvdb_series_title;
            series.poster = self.selectedMatch.poster;
            series.posterResolved = self.selectedMatch.posterResolved;
          });
        }
        $modalInstance.close();
      };

      self.cancel = function() {
        $modalInstance.dismiss();
      };
    }]);