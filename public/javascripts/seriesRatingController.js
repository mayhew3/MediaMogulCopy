angular.module('mediaMogulApp')
  .controller('seriesRatingController', ['$log', 'EpisodeService', '$modalInstance', 'episodeGroup', '$modal', '$filter',
  function($log, EpisodeService, $modalInstance, episodeGroup, $modal, $filter) {
    var self = this;

    self.episodeGroup = episodeGroup;
    self.episodeGroup.rating = self.episodeGroup.rating == null ? null : parseFloat(self.episodeGroup.rating);

    $log.debug("SeriesId: " + self.episodeGroup.series_id);

    self.posterResolved = episodeGroup.poster ? 'http://thetvdb.com/banners/' + episodeGroup.poster : 'images/GenericSeries.gif';

    self.episodes = [];
    self.possibleMatches = [];

    self.tiers = [1, 2, 3, 4, 5];

    self.seasonLabels = [];
    self.selectedSeason = null;

    self.viewingLocations = EpisodeService.getViewingLocations();

    self.inputViewingLocations = [];

    self.showDetail = false;

    EpisodeService.updateEpisodeListForRating(self.episodeGroup).then(function() {
      self.episodes = EpisodeService.getEpisodes();
      $log.debug("Updated list with " + self.episodes.length + " episodes!");
    });

    self.shouldShowRate = function(episode) {
      return episode.rating_value == null && (isTiVoAvailable(episode) || isStreamingAvailable(episode));
    };

    self.getWatchedDateOrWatched = function(episode) {
      // $log.debug("In getWatchedDateOrWatched. WatchedDate: " + episode.watched_date);
      if (episode.watched_date == null) {
        return episode.watched ? "----.--.--" : "";
      } else {
        return $filter('date')(episode.watched_date, self.getDateFormat(episode.watched_date), '+0000');
      }
    };

    self.cleanUpRating = function(rating, watched) {
      if (rating != null) {
        return rating;
      }
      return watched === true ? "--" : "";
    };

    self.getRating = function(episode) {
      return self.cleanUpRating(episode.rating_value, episode.watched);
    };

    self.getRatingFunny = function(episode) {
      return self.cleanUpRating(episode.rating_funny, episode.watched);
    };

    self.getRatingCharacter = function(episode) {
      return self.cleanUpRating(episode.rating_character, episode.watched);
    };

    self.getRatingStory = function(episode) {
      return self.cleanUpRating(episode.rating_story, episode.watched);
    };

    function isStreamingAvailable(episode) {
      return episode.streaming && !airsInTheNextXDays(episode, 0);
    }

    function isTiVoAvailable(episode) {
      return episode.on_tivo || !isUnaired(episode)
    }

    function isUnaired(episode) {
      // unaired if the air date is more than a day after now.

      var isNull = episode.air_date == null;
      var diff = (new Date(episode.air_date) - new Date + (1000 * 60 * 60 * 24));
      var hasSufficientDiff = (diff > 0);

      return isNull || hasSufficientDiff;
    }

    function airsInTheNextXDays(episode, days) {
      // unaired if the air date is more than a day after now.

      var isNull = episode.air_date == null;
      var diff = (new Date(episode.air_date) - new Date + (1000 * 60 * 60 * 24 * days));
      var hasSufficientDiff = (diff > 0);

      return isNull || hasSufficientDiff;
    }

    self.originalFields = {
      rating: self.episodeGroup.rating,
      review: self.episodeGroup.review
    };

    self.interfaceFields = {
      rating: self.episodeGroup.rating,
      review: self.episodeGroup.review
    };


    self.episodeFilter = function(episode) {
      var airDate = episode.air_date == null ? null : new Date(episode.air_date);
      var startDate = episodeGroup.start_date == null ? null : new Date(episodeGroup.start_date);
      var endDate = episodeGroup.end_date == null ? null : new Date(episodeGroup.end_date);

      return episode.season != 0 &&
        airDate != null && startDate != null && endDate != null &&
        airDate > startDate &&
        airDate < endDate;
    };

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

    self.colorStyleMinor = function(scaledValue) {
      if (scaledValue == null) {
        return {};
      } else {
        var hue = (scaledValue <= 50) ? scaledValue * 0.5 : (50 * 0.5 + (scaledValue - 50) * 4.5);
        return {
          'background-color': 'hsla(' + hue + ', 50%, 42%, 1)',
          'font-size': '1.4em',
          'text-align': 'center',
          'font-weight': '600',
          'color': 'white'
        }
      }
    };

    self.getDateFormat = function(date) {
      var thisYear = (new Date).getFullYear();

      if (date != null) {
        var year = new Date(date).getFullYear();

        if (year === thisYear) {
          return 'EEE M/d';
        } else {
          return 'yyyy.M.d';
        }
      }
      return 'yyyy.M.d';
    };

    self.openEpisodeDetail = function(episode) {
      $modal.open({
        templateUrl: 'views/episodeDetail.html',
        controller: 'episodeDetailController as ctrl',
        size: 'lg',
        resolve: {
          episode: function() {
            return episode;
          },
          previousEpisodes: function() {
            return getPreviousEpisodes(episode);
          }
        }
      }).result.finally(function() {
        EpisodeService.updateDenorms(self.episodeGroup, self.episodes);
      });
    };

    self.updateRating = function() {
      episodeGroup.rating = self.interfaceFields.rating;
      episodeGroup.review = self.interfaceFields.review;

      var changedFields = self.getChangedFields();
      if (Object.keys(changedFields).length > 0) {
        return EpisodeService.updateEpisodeGroupRating(self.episodeGroup.id, changedFields);
      }
      return new Promise(function(resolve) {
        resolve();
      });
    };

    self.getChangedFields = function() {
      var changedFields = {};
      for (var key in self.interfaceFields) {
        if (self.interfaceFields.hasOwnProperty(key)) {
          var value = self.interfaceFields[key];

          $log.debug("In loop, key: " + key + ", value: " + value + ", old value: " + self.originalFields[key]);

          if (value != self.originalFields[key]) {
            $log.debug("Changed detected... ");
            changedFields[key] = value;
          }
        }
      }

      return changedFields;
    };


    self.updateAndClose = function() {
      self.updateRating()
        .then(function () {
          $modalInstance.close();
        });
    };

    self.cancel = function() {
      $modalInstance.dismiss();
    }
  }]);