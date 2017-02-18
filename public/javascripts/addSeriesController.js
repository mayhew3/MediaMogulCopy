angular.module('mediaMogulApp')
  .controller('addSeriesController', ['$log', 'EpisodeService', '$modalInstance', 'auth',
  function($log, EpisodeService, $modalInstance, auth) {
    var self = this;

    self.auth = auth;

    self.series = {};

    self.tiers = [1, 2, 3, 4, 5];

    self.selectedLocation = null;

    self.showExists = false;

    self.viewingLocations = EpisodeService.getViewingLocations();


    self.updateShowExists = function() {
      var title = self.series.title;
      self.showExists = !!EpisodeService.getSeriesWithTitle(title);
    };

    self.getButtonClass = function(tier) {
      return self.series.tier === tier ? "btn btn-success" : "btn btn-primary";
    };

    self.getLocButtonClass = function(location) {
      if (self.selectedLocation == null) {
        return "btn btn-primary";
      }
      return self.selectedLocation.name === location.name ? "btn btn-success" : "btn btn-primary";
    };


    self.ok = function() {
      self.series.ViewingLocations = [self.selectedLocation];
      self.series.date_added = new Date;
      self.series.tvdb_match_status = 'Match First Pass';
      var errorResponse = EpisodeService.addSeries(self.series);
      if (errorResponse) {
        $log.debug("Error adding series. Response: " + errorResponse);
      } else {
        $modalInstance.close();
      }
    };

    self.cancel = function() {
      $modalInstance.close();
    }
  }]);