angular.module('mediaMogulApp')
  .controller('myShowsController', ['$log', '$uibModal', '$interval', 'EpisodeService', 'auth',
  function($log, $uibModal, $interval, EpisodeService, auth) {
    var self = this;

    self.auth = auth;

    self.series = [];

    self.tiers = [1, 2, 3, 4, 5];
    self.unwatchedOnly = true;

    self.selectedPill = "Main";

    self.quickFindResult = undefined;

    self.currentPage = 1;
    self.pageSize = 12;

    self.isActive = function(pillName) {
      return (pillName === self.selectedPill) ? "active" : null;
    };

    self.seriesFilter = function(series) {
      return (self.unwatchedOnly ?
          hasUnwatchedEpisodes(series) :
          (series.matched_episodes + series.streaming_episodes + series.unmatched_episodes) > 0)
        && !series.suggestion && series.tvdb_series_id !== null;
    };

    self.firstTier = function(series) {
      return series.my_tier === 1
         && hasUnwatchedEpisodes(series)
        ;
    };

    self.secondTier = function(series) {
      return series.my_tier === 2
         && hasUnwatchedEpisodes(series)
        ;
    };

    self.upcomingSoon = function(series) {
      return airingInNextDays(series.nextAirDate, 7);
    };

    self.showInQueue = function(series) {
      return self.firstTier(series) &&
        dateIsWithinLastDays(series.first_unwatched, 8);
    };

    self.recentlyWatched = function(series) {
      return self.firstTier(series) &&
        dateIsWithinLastDays(series.last_watched, 14) &&
        !self.showInQueue(series);
    };

    self.otherActive = function(series) {
      return self.firstTier(series) &&
        !self.showInQueue(series) &&
        !self.recentlyWatched(series) &&
        series.last_watched !== null;
    };

    self.toStart = function(series) {
      return self.firstTier(series) &&
      !self.showInQueue(series) &&
      !self.recentlyWatched(series) &&
      series.last_watched === null;
    };

    self.newlyAdded = function(series) {
      return series.my_tier === null;
    };

    self.hasInactiveUnmatched = function(series) {
      return hasInactiveUnmatchedEpisodes(series);
    };

    self.hasImportantUnmatched = function(series) {
      return hasImportantUnmatchedEpisodes(series);
    };

    self.countWhere = function(filter) {
      return self.series.filter(filter).length;
    };

    self.orderByRating = function(series) {
      return (angular.isDefined(series.FullRating) ? -1: 0);
    };

    function hasUnwatchedEpisodes(series) {
      return series.unwatched_all > 0;
    }

    function hasInactiveUnmatchedEpisodes(series) {
      return series.unmatched_episodes > 0 && series.my_tier !== 1;
    }

    function hasImportantUnmatchedEpisodes(series) {
      return series.unmatched_episodes > 0 && series.my_tier === 1;
    }

    function dateIsWithinLastDays(referenceDate, daysAgo) {
      var notNull = referenceDate !== null;
      var diff = (new Date(referenceDate) - new Date() + (1000 * 60 * 60 * 24 * daysAgo));
      var withinDiff = (diff > 0);

      return notNull && withinDiff;
    }

    function airingInNextDays(airDate, days) {
      var notNull = airDate !== null;
      var diff = (new Date() - new Date(airDate) + (1000 * 60 * 60 * 24 * days));
      var withinDiff = (diff > 0);

      // $log.debug("AirDate: " + airDate + ", diff: " + diff);

      return notNull && withinDiff;
    }

    function updateFullRating(series) {
      var metacritic = series.metacritic;
      var myRating = series.my_rating;

      series.FullRating = myRating === null ?
        (metacritic === null ? 0 : metacritic) : myRating;

      series.colorStyle = function() {
        if (series.FullRating === null || series.FullRating === 0) {
          return {};
        } else {
          var hue = (series.FullRating <= 50) ? series.FullRating * 0.5 : (50 * 0.5 + (series.FullRating - 50) * 4.5);
          return {
            'background-color': 'hsla(' + hue + ', 50%, 42%, 1)',
            'font-size': '1.6em',
            'text-align': 'center',
            'font-weight': '800',
            'color': 'white'
          }
        }
      };
    }

    self.refreshSeriesList = function() {
      EpisodeService.updateMyShowsList().then(function () {
        self.series = EpisodeService.getMyShows();
        $log.debug("Controller has " + self.series.length + " shows.");
        self.series.forEach(function (seri) {
          updateFullRating(seri);
        });
        self.series = _.sortBy(self.series, function(show) {
          return 0 - show.FullRating;
        });
      });
    };
    self.refreshSeriesList();

    // $interval(self.refreshSeriesList, 60*1000*5);

    self.getButtonClass = function(tier, series) {
      return series.my_tier === tier ? "btn btn-success" : "btn btn-primary";
    };

    self.changeTier = function(series) {
      EpisodeService.changeTier(series.id, series.tier);
    };

    self.posterStyle = function(series) {
      if (series.recordingNow === true) {
        return {"border": "solid red"};
      } else {
        return {};
      }
    };

    self.open = function(series) {
      $uibModal.open({
        templateUrl: 'views/tv/seriesDetail.html',
        controller: 'mySeriesDetailController as ctrl',
        size: 'lg',
        resolve: {
          series: function() {
            return series;
          },
          owned: function() {
            return true;
          }
        }
      }).result.finally(function() {
        self.quickFindResult = undefined;
      });
    };

    self.tryToMatch = function(series) {
      $log.debug("Executing!");
      $uibModal.open({
        templateUrl: 'views/tv/episodeMatcher.html',
        controller: 'episodeMatcherController as ctrl',
        size: 'lg',
        resolve: {
          series: function() {
            return series;
          }
        }
      });
    };

    self.addSeries = function() {
      $log.debug("Adding window.");
      $uibModal.open({
        templateUrl: 'views/tv/addSeries.html',
        controller: 'addSeriesController as ctrl',
        size: 'lg',
        resolve: {
        }
      }).result.finally(function() {
        self.refreshSeriesList();
      });
    };
  }
]);