angular.module('mediaMogulApp')
  .controller('matchController', ['$log', '$modal', 'EpisodeService', 'auth',
    function($log, $modal, EpisodeService, auth) {
      var self = this;

      self.series = [];

      self.auth = auth;

      self.selectedPill = "Needs First Pass";

      self.isActive = function(pillName) {
        return (pillName == self.selectedPill) ? "active" : null;
      };

      self.clearTempFlags = function() {
        self.series.forEach(function (series) {
          delete series.temp_confirmed;
          delete series.temp_ignored;
        })
      };

      self.changeSelectedPill = function(pillName) {
        self.selectedPill = pillName;
        self.clearTempFlags();
      };

      self.changeToNeedsFirstPass = function() {
        self.changeSelectedPill('Needs First Pass');
        self.selectedFilter = self.needsFirstPassFilter;
      };

      self.changeToMatchPending = function() {
        self.changeSelectedPill('Match Pending');
        self.selectedFilter = self.matchPendingFilter;
      };

      self.needsFirstPassFilter = function(series) {
        return series.tvdb_match_status === 'Needs First Pass' || series.temp_ignored;
      };

      self.matchPendingFilter = function(series) {
        return series.tvdb_match_status === 'Match Pending' || series.temp_confirmed || series.temp_ignored;
      };

      self.selectedFilter = self.needsFirstPassFilter;

      self.getSeriesNameClass = function(series) {
        if (series.temp_ignored) {
          return "ignored";
        }
        if (series.temp_confirmed) {
          return "confirmed";
        }
        return "";
      };

      self.refreshSeriesList = function() {
        EpisodeService.updateSeriesList().then(function () {
          self.series = EpisodeService.getSeriesList();
          $log.debug("Controller has " + self.series.length + " shows.");
        });
      };
      self.refreshSeriesList();

      self.ignoreSeries = function(series) {
        var changedFields = {
          tvdb_ignore_date: new Date,
          tvdb_match_status: 'Ignored'
        };
        EpisodeService.updateSeries(series.id, changedFields).then(function () {
          series.temp_ignored = true;
          series.previous_status = series.tvdb_match_status;
          series.tvdb_match_status = 'Ignored';
        });
      };

      self.unIgnoreSeries = function(series) {
        var changedFields = {
          tvdb_ignore_date: null,
          tvdb_match_status: series.previous_status
        };
        EpisodeService.updateSeries(series.id, changedFields).then(function () {
          series.temp_ignored = false;
          series.tvdb_match_status = series.previous_status;
          series.previous_status = null;
        });
      };

      self.confirmMatch = function(series) {
        var changedFields = {
          tvdb_confirm_date: new Date,
          tvdb_match_status: 'Match Confirmed'
        };
        EpisodeService.updateSeries(series.id, changedFields).then(function () {
          series.temp_confirmed = true;
          series.previous_status = series.tvdb_match_status;
          series.tvdb_match_status = 'Match Confirmed';
        });
      };

      self.unConfirmMatch = function(series) {
        var changedFields = {
          tvdb_confirm_date: null,
          tvdb_match_status: series.previous_status
        };
        EpisodeService.updateSeries(series.id, changedFields).then(function () {
          series.temp_confirmed = false;
          series.tvdb_match_status = series.previous_status;
          series.previous_status = null;
        });
      };

    }
  ]);