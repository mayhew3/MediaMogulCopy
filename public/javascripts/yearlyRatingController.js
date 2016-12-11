angular.module('mediaMogulApp')
  .controller('yearlyRatingController', ['$log', '$modal', 'EpisodeService',
  function($log, $modal, EpisodeService) {
    var self = this;

    self.episodeGroups = [];

    self.year = 2016;

    self.refreshEpisodeGroupList = function(year) {
      EpisodeService.updateEpisodeGroupRatings(year).then(function () {
        self.episodeGroups = EpisodeService.getEpisodeGroupRatings();
        $log.debug("Controller has " + self.episodeGroups.length + " shows.");
      });
    };
    self.refreshEpisodeGroupList(self.year);

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

    self.unratedGroupFilter = function(episodeGroup) {
      return (episodeGroup.num_episodes === episodeGroup.watched) && episodeGroup.rating == null;
    };

    self.episodeGroupFilter = self.unratedGroupFilter;

    self.orderBySuggested = function(episodeGroup) {
      return ((episodeGroup.suggested_rating == null) ? 1 : 0);
    };

    self.openSeriesRating = function(episodeGroup) {
      $modal.open({
        templateUrl: 'views/seriesRating.html',
        controller: 'seriesRatingController as ctrl',
        size: 'lg',
        resolve: {
          episodeGroup: function() {
            return episodeGroup;
          }
        }
      });
    };

  }
]);