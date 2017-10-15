angular.module('mediaMogulApp')
  .controller('editSeriesController', ['$log', 'EpisodeService', '$modalInstance', 'series', 'auth',
  function($log, EpisodeService, $modalInstance, series, auth) {
    var self = this;

    self.auth = auth;

    self.series = series;

    self.tiers = [1, 2, 3, 4, 5];
    self.viewingLocations = EpisodeService.getViewingLocations();
    self.originalViewingLocations = [];
    self.inputViewingLocations = [];
    self.addedViewingLocations = [];
    self.removedViewingLocations = [];

    updateViewingLocations();

    function updateViewingLocations() {
      self.viewingLocations.forEach(function(viewingLocation) {
        var locationObj = {
          active: containsMatchingLocation(self.series.viewingLocations, viewingLocation.id),
          viewingLocation: viewingLocation
        };
        self.inputViewingLocations.push(locationObj);
      });
      $log.debug("ViewingLocations array: " + JSON.stringify(self.inputViewingLocations));

      self.isStreaming = function() {
        return EpisodeService.isStreaming(self.series);
      };
    }


    function containsMatchingLocation(arr, locationId) {
      var foundElement = arr.find(function(element) {
        return element.id === locationId;
      });
      return !(foundElement === undefined);
    }

    self.changeViewingLocation = function(location) {


      if (location.active) {
        EpisodeService.addViewingLocation(self.series, self.episodes, location.viewingLocation);
      } else {
        EpisodeService.removeViewingLocation(self.series, self.episodes, location.viewingLocation);
      }
    };

    self.originalFields = {
      metacritic: self.series.metacritic,
      my_rating: self.series.my_rating,
      tvdb_hint: self.series.tvdb_hint,
      metacritic_hint: self.series.metacritic_hint
    };

    self.interfaceFields = {
      metacritic: self.series.metacritic,
      my_rating: self.series.my_rating,
      tvdb_hint: self.series.tvdb_hint,
      metacritic_hint: self.series.metacritic_hint
    };

    self.getTierButtonClass = function(tier) {
      return self.series.tier === tier ? "btn btn-success" : "btn btn-primary";
    };

    self.getLocButtonClass = function(location) {
      return location.active ? "btn btn-success" : "btn btn-primary";
    };


    self.changeTier = function() {
      EpisodeService.changeTier(self.series.id, self.series.tier);
    };


    self.changeValues = function() {
      self.series.metacritic = self.interfaceFields.metacritic;
      self.series.my_rating = self.interfaceFields.my_rating;
      self.series.tvdb_hint = self.interfaceFields.tvdb_hint;
      self.series.metacritic_hint = self.interfaceFields.metacritic_hint;

      var changedFields = {};
      for (var key in self.interfaceFields) {
        if (self.interfaceFields.hasOwnProperty(key)) {
          var value = self.interfaceFields[key];

          $log.debug("In loop, key: " + key + ", value: " + value + ", old value: " + self.originalFields[key]);

          if (value !== self.originalFields[key]) {
            $log.debug("Changed detected... ");
            changedFields[key] = value;
          }
        }
      }

      $log.debug("Changed fields: " + JSON.stringify(changedFields));

      if (Object.getOwnPropertyNames(changedFields).length > 0) {
        $log.debug("Changed fields has a length!");
        EpisodeService.updateSeries(self.series.id, changedFields);
      }

      $modalInstance.close();
    };

    self.cancel = function() {
      $modalInstance.dismiss();
    };
  }]);