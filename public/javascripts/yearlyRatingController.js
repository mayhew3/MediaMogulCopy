angular.module('mediaMogulApp')
  .controller('yearlyRatingController', ['$log', '$modal', 'EpisodeService',
  function($log, $modal, EpisodeService) {
    var self = this;

    self.series = [];

    self.year = 2016;

    self.refreshSeriesList = function(year) {
      EpisodeService.updateEpisodeGroupRatings(year).then(function () {
        self.series = EpisodeService.getEpisodeGroupRatings();
        $log.debug("Controller has " + self.series.length + " shows.");
      });
    };
    self.refreshSeriesList(self.year);

    self.colorStyle = function(scaledValue) {
      if (scaledValue == null) {
        return {};
      } else {
        var hue = (scaledValue <= 50) ? scaledValue * 0.5 : (50 * 0.5 + (scaledValue - 50) * 4.5);
        return {
          'background-color': 'hsla(' + hue + ', 50%, 42%, 1)',
          'font-size': '1.6em',
          'text-align': 'center',
          'font-weight': '800',
          'color': 'white'
        }
      }
    };

    self.seriesFilter = function(series) {
      return (series.num_episodes === series.watched) && series.rating == null;
    };

    self.orderBySuggested = function(series) {
      return ((series.suggested_rating == null) ? 1 : 0);
    };
  }
]);