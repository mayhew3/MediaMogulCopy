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

    self.colorStyle = function(scaledValue, full) {
      if (scaledValue == null) {
        return {};
      } else {
        var saturation = full ? "50%" : "20%";
        var fontColor = full ? "white" : "light gray";
        var hue = (scaledValue <= 50) ? scaledValue * 0.5 : (50 * 0.5 + (scaledValue - 50) * 4.5);
        return {
          'background-color': 'hsla(' + hue + ', ' + saturation + ', 42%, 1)',
          'font-size': '1.6em',
          'text-align': 'center',
          'font-weight': '800',
          'color': fontColor
        }
      }
    };

    self.colorStyleFull = function(scaledValue) {
      return self.colorStyle(scaledValue, true);
    };

    self.colorStyleMuted = function(scaledValue) {
      return self.colorStyle(scaledValue, false);
    };

    self.getBestRating = function(episodeGroup) {
      return episodeGroup.rating == null ? episodeGroup.suggested_rating : episodeGroup.rating;
    };

    self.getBestRatingColorStyle = function(episodeGroup) {
      return episodeGroup.rating == null ? self.colorStyleMuted(episodeGroup.suggested_rating) : self.colorStyleFull(episodeGroup.rating);
    };

    self.unratedGroupFilter = function(episodeGroup) {
      return (episodeGroup.num_episodes === episodeGroup.watched) && episodeGroup.rating == null;
    };

    self.fullyWatchedGroupFilter = function(episodeGroup) {
      return (episodeGroup.num_episodes === episodeGroup.watched);
    };

    self.episodeGroupFilter = self.fullyWatchedGroupFilter;

    self.orderByRating = function(episodeGroup) {
      return episodeGroup.rating == null ?
                (episodeGroup.suggested_rating == null ?
                  101 : (100 - episodeGroup.suggested_rating)) :
        (100 - episodeGroup.rating);
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