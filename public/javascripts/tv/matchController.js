angular.module('mediaMogulApp')
  .controller('matchController', ['$log', '$uibModal', 'EpisodeService', 'auth',
    function($log, $uibModal, EpisodeService, auth) {
      var self = this;

      self.series = [];

      self.auth = auth;

      self.selectedPill = "Series";

      self.isActive = function(pillName) {
        return (pillName === self.selectedPill) ? "active" : null;
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

      self.changeToSeries = function() {
        self.changeSelectedPill('Series');
      };

      self.statusFilter = function(series, status) {
        return series.tvdb_match_status === status || series.previous_status === status;
      };

      self.matchFirstPassFilter = function(series) {
        return self.statusFilter(series, 'Match First Pass');
      };

      self.needsConfirmationFilter = function(series) {
        return self.statusFilter(series, 'Needs Confirmation');
      };

      self.duplicateFilter = function(series) {
        return self.statusFilter(series, 'Duplicate');
      };

      self.needsHintFilter = function(series) {
        return self.statusFilter(series, 'Needs Hint');
      };

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
        EpisodeService.updateSeriesMatchList().then(function () {
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

      self.open = function(series) {
        $uibModal.open({
          templateUrl: 'views/mytv/match/matchConfirmation.html',
          controller: 'matchConfirmationController as ctrl',
          size: 'lg',
          resolve: {
            series: function() {
              return series;
            }
          }
        });
      };

    }
  ]);