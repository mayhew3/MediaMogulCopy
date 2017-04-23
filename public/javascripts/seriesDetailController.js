angular.module('mediaMogulApp')
  .controller('seriesDetailController', ['$log', 'EpisodeService', '$modalInstance', 'series', '$modal', '$filter', 'auth',
  function($log, EpisodeService, $modalInstance, series, $modal, $filter, auth) {
    var self = this;

    self.auth = auth;

    self.series = series;
    self.episodes = [];
    self.possibleMatches = [];

    self.tiers = [1, 2, 3, 4, 5];

    self.seasonLabels = [];
    self.selectedSeason = null;

    self.viewingLocations = EpisodeService.getViewingLocations();

    self.inputViewingLocations = [];

    EpisodeService.updateEpisodeList(self.series).then(function() {
      self.episodes = EpisodeService.getEpisodes();
      $log.debug("Updated list with " + self.episodes.length + " episodes!");
    }).then(function() {
      updateSeasonLabels();
      updateViewingLocations();
    });

    self.shouldHide = function(episode) {
      return episode.retired ||
        // todo: remove when MM-236 is resolved.
        episode.air_time === null;
    };


    function updateSeasonLabels() {
      self.episodes.forEach(function (episode) {
        // $log.debug("AIR DATE: " + episode.air_date);
        var season = episode.season;
        if (season !== null && !(self.seasonLabels.indexOf(season) > -1) && !self.shouldHide(episode)) {
          self.seasonLabels.push(season);
        }
      });

      var unwatchedEpisodes = self.episodes.filter(function (episode) {
        return episode.season !== null && episode.season > 0 &&
                episode.watched === false &&
                !self.shouldHide(episode);
      });

      if (unwatchedEpisodes.length > 0) {
        self.selectedSeason = unwatchedEpisodes[0].season;
      } else {
        var allEpisodes = self.episodes.filter(function (episode) {
          return episode.season !== null && episode.season > 0 &&
                  !self.shouldHide(episode);
        });

        if (allEpisodes.length > 0) {
          self.selectedSeason = allEpisodes[0].season;
        } else {
          self.selectedSeason = 0;
        }
      }
    }

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

    EpisodeService.updatePossibleMatches(self.series).then(function() {
      self.possibleMatches = EpisodeService.getPossibleMatches();
      $log.debug("Updated " + self.possibleMatches.length + " possible matches.");
    });

    self.wrongMatch = function() {
      EpisodeService.updateSeries(self.series.id, {matched_wrong: self.series.matched_wrong});
    };

    self.useMatch = function(possibleMatch) {
      $log.debug("Match selected: " + possibleMatch.SeriesTitle + '(' + possibleMatch.SeriesID + ')');
      var changedFields = {
        tvdb_match_id: possibleMatch.tvdb_match_id,
        needs_tvdb_redo: true,
        matched_wrong: false
      };
      EpisodeService.updateSeries(self.series.id, changedFields).then(function () {
        self.series.needs_tvdb_redo = true;
        self.series.matched_wrong = false;
      });
    };

    self.getLabelInfo = function(episode) {
      if (episode.on_tivo) {
        if (episode.tivo_deleted_date) {
          return {labelClass: "label label-default", labelText: "Deleted"};
        } else if (episode.tivo_suggestion === true) {
          return {labelClass: "label label-warning", labelText: "Suggestion"};
        } else {
          return {labelClass: "label label-info", labelText: "Recorded"};
        }
      } else if (episode.streaming) {
        if (isUnaired(episode)) {
          return {labelClass: "label label-danger", labelText: "Unaired"};
        } else {
          return {labelClass: "label label-success", labelText: "Streaming"};
        }
      } else {
        if (isUnaired(episode)) {
          return {labelClass: "label label-danger", labelText: "Unaired"};
        }
        return null;
      }
    };

    self.shouldHideMarkWatched = function(episode) {
      return (!episode.on_tivo || episode.watched) && (episode.on_tivo || isUnaired(episode));
    };

    self.shouldShowMarkWatched = function(episode) {
      return !episode.watched && episode.rating_value !== null &&
      (episode.on_tivo || !isUnaired(episode));
    };

    self.shouldShowRate = function(episode) {
      return episode.rating_value === null && (isTiVoAvailable(episode) || isStreamingAvailable(episode));
    };

    self.getWatchedDateOrWatched = function(episode) {
      // $log.debug("In getWatchedDateOrWatched. WatchedDate: " + episode.watched_date);
      if (episode.watched_date === null) {
        return episode.watched ? "----.--.--" : "";
      } else {
        return $filter('date')(episode.watched_date, self.getDateFormat(episode.watched_date), 'America/Los_Angeles');
      }
    };

    self.getRating = function(episode) {
      var rating = episode.rating_value;
      if (rating !== null) {
        return rating;
      }
      return episode.watched === true ? "--" : "";
    };

    function isStreamingAvailable(episode) {
      return episode.streaming && !airsInTheNextXDays(episode, 0);
    }

    function isTiVoAvailable(episode) {
      return episode.on_tivo || !isUnaired(episode)
    }

    function isUnaired(episode) {
      // unaired if the air time is after now.

      var isNull = episode.air_time === null;
      var diff = (new Date(episode.air_time) - new Date);
      var hasSufficientDiff = (diff > 0);

      return isNull || hasSufficientDiff;
    }

    function airsInTheNextXDays(episode, days) {
      var isNull = episode.air_time === null;
      var diff = (new Date(episode.air_time) - new Date + (1000 * 60 * 60 * 24 * days));
      var hasSufficientDiff = (diff > 0);

      return isNull || hasSufficientDiff;
    }

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

    self.episodeFilter = function(episode) {
      return episode.season === self.selectedSeason && !self.shouldHide(episode);
    };


    self.getSeasonButtonClass = function(season) {
      return self.selectedSeason === season ? "btn btn-success" : "btn btn-primary";
    };

    self.getDateFormat = function(date) {
      var thisYear = (new Date).getFullYear();

      if (date !== null) {
        var year = new Date(date).getFullYear();

        if (year === thisYear) {
          return 'EEE M/d';
        } else {
          return 'yyyy.M.d';
        }
      }
      return 'yyyy.M.d';
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

    self.markAllPastWatched = function() {
      var lastWatched = null;
      self.episodes.forEach(function(episode) {
        if ((lastWatched === null || lastWatched < episode.air_time)
          && episode.watched && episode.season !== 0) {

          lastWatched = episode.air_time;
        }
      });

      EpisodeService.markAllWatched(self.series.id, lastWatched).then(function() {
        $log.debug("Finished update, adjusting denorms.");
        self.episodes.forEach(function(episode) {
          $log.debug(lastWatched + ", " + episode.air_time);
          if (episode.air_time !== null && episode.air_time < lastWatched && episode.season !== 0) {
            episode.watched = true;
          }
        });
        EpisodeService.updateDenorms(self.series, self.episodes);
      });

      $log.debug("Series '" + self.series.title + "' " + self.series.id);
    };

    function getPreviousEpisodes(episode) {
      var allEarlierEpisodes = self.episodes.filter(function (otherEpisode) {
        return  otherEpisode.air_date !== null &&
                otherEpisode.season !== 0 &&
                ((otherEpisode.season < episode.season) ||
                (otherEpisode.season === episode.season &&
                otherEpisode.episode_number < episode.episode_number));
      });

      var earlierSorted = allEarlierEpisodes.sort(function(e1, e2) {
        if (e1.season === e2.season) {
          return e2.episode_number - e1.episode_number;
        } else {
          return e2.season - e1.season;
        }
      });


      if (earlierSorted.length < 5) {
        return earlierSorted;
      }

      return [
        earlierSorted[0],
        earlierSorted[1],
        earlierSorted[2],
        earlierSorted[3]
      ];

    }


    self.changeMetacritic = function(series) {
      series.metacritic = self.interfaceFields.metacritic;
      series.my_rating = self.interfaceFields.my_rating;
      series.tvdb_hint = self.interfaceFields.tvdb_hint;
      series.metacritic_hint = self.interfaceFields.metacritic_hint;

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
        EpisodeService.updateSeries(series.id, changedFields);
      }
    };

    self.markWatched = function(episode, withoutDate) {
      var dateToUpdate = withoutDate ? null : new Date;
      EpisodeService.markWatched(self.series.id, episode.id, episode.watched, dateToUpdate).then(function () {
        EpisodeService.updateDenorms(self.series, self.episodes);
      });
    };

    self.unwatch = function(episode) {
      EpisodeService.markWatched(self.series.id, episode.id, false, null).then(function () {
        EpisodeService.updateDenorms(self.series, self.episodes);
      });
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
          },
          series: function() {
            return series;
          }
        }
      }).result.finally(function() {
        EpisodeService.updateDenorms(self.series, self.episodes);
      });
    };

    self.openChangePoster = function () {
      $modal.open({
        templateUrl: 'views/tv/shows/changePoster.html',
        controller: 'changePosterController',
        controllerAs: 'ctrl',
        size: 'lg',
        resolve: {
          series: function() {
            return self.series;
          }
        }
      })
    };

    self.ok = function() {
      $modalInstance.close();
    };
  }]);