angular.module('mediaMogulApp')
  .controller('changePosterController', ['$log', 'EpisodeService', '$modalInstance', 'series', '$modal', '$filter', 'auth',
    function($log, EpisodeService, $modalInstance, series, $modal, $filter, auth) {
      var self = this;

      self.auth = auth;

      self.series = series;
      self.allPosters = [];

      self.selectedPoster = null;

      EpisodeService.updateAllPosters(self.series).then(function() {
        self.allPosters = EpisodeService.getAllPosters();
        $log.debug("Updated " + self.allPosters.length + " posters.");

        self.allPosters.forEach(function (poster) {
          if (series.poster == poster.poster_path) {
            self.selectedPoster = poster;
          }
        });
      });


      self.posterStyle = function(poster) {
        if (poster == self.selectedPoster) {
          return {"border": "solid limegreen"};
        } else {
          return {"border": "solid gray"};
        }
      };

      self.selectPoster = function(poster) {
        self.selectedPoster = poster;
      };


      self.ok = function() {
        if (self.selectedPoster.poster_path != series.poster) {
          var changedFields = {
            poster: self.selectedPoster.poster_path
          };
          EpisodeService.updateSeries(series.id, changedFields).then(function() {
            series.poster = self.selectedPoster.poster_path;
            series.posterResolved = self.selectedPoster.posterResolved;
          });
        }
        $modalInstance.close();
      };

      self.cancel = function() {
        $modalInstance.dismiss();
      };
    }]);