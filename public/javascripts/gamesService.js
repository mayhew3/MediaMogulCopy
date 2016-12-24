function GamesService($log, $http) {
  var games = [];
  var platforms = [];
  var self = this;

  this.updateGamesList = function() {
    return $http.get('/api/games').then(function (gamesResponse) {
      $log.debug("Games returned " + gamesResponse.data.length + " items.");
      var tempGames = gamesResponse.data;
      tempGames.forEach(function (game) {
        self.updateNumericFields(game);
        //self.updateImages(game);
        self.updatePlaytimes(game);
        self.updateRating(game);
        self.updatePlatforms(game);
      });
      $log.debug("Finished updating.");
      games = tempGames;
    }, function (errResponse) {
      console.error('Error while fetching games list: ' + errResponse);
    });
  };



  this.updateNumericFields = function(game) {
    if (game.metacritic != null) {
      game.metacritic = parseFloat(game.metacritic);
    }
    if (game.mayhew != null) {
      game.mayhew = parseFloat(game.mayhew);
    }
    if (game.guess != null) {
      game.guess = parseFloat(game.guess);
    }
    if (game.timeplayed != null) {
      game.timeplayed = parseFloat(game.timeplayed);
    }
    if (game.timetotal != null) {
      game.timetotal = parseFloat(game.timetotal);
    }
    if (game.replay != null) {
      game.replay = parseFloat(game.replay);
    }
    if (game.finalscore != null) {
      game.finalscore = parseFloat(game.finalscore);
    }
    if (game.howlong_id != null) {
      game.howlong_id = parseInt(game.howlong_id);
    }
    if (game.giantbomb_id != null) {
      game.giantbomb_id = parseInt(game.giantbomb_id);
    }
  };

  this.getGamesList = function() {
    return games;
  };

  this.getPlatformList = function() {
    return platforms;
  };

  this.getGameWithTitleAndPlatform = function(title, platform) {
    var filtered = games.filter(function(gameElement) {
      return (gameElement.title == title && gameElement.platform == platform);
    });
    return filtered[0];
  };

  this.addGame = function(game) {
    $log.debug("Adding game " + JSON.stringify(game));
    $http.post('/api/addgame', {game: game}).then(function() {
      self.updateRating(game);
      $log.debug(game.title + " updated to rating: " + game.FullRating);
      games.push(game);
      return null;
    }, function(errResponse) {
      return errResponse;
    });
  };


  this.updateGame = function(GameId, ChangedFields) {
    $log.debug('Received update for Game ' + GameId + " with data " + JSON.stringify(ChangedFields));
    return $http.post('/api/updategame', {GameId: GameId, ChangedFields: ChangedFields});
  };

  this.updateRating = function(game) {
    var metacritic = game.metacritic;
    var myRating = game.mayhew;
    var myGuess = game.guess;

    if (myRating == null) {
      myRating = myGuess;
    }

    if (metacritic == null) {
      game.FullRating = myRating;
    } else if (myRating == null) {
      game.FullRating = metacritic;
    } else {
      var relevantPlaytime = game.aggPlaytime;
      if (relevantPlaytime == null) {
        relevantPlaytime = 0;
      } else if (relevantPlaytime > 3) {
        relevantPlaytime = 3;
      }

      game.myAggregate = myRating;

      var myWeight = 0.40 + (relevantPlaytime * 0.20);
      var metaWeight = 1 - myWeight;

      game.FullRating = (myRating * myWeight) + (metacritic * metaWeight);
    }
  };

  this.updateImages = function(game) {
    $log.debug("Image: " + game.logo);
    if (game.logo == null || game.logo == '') {
      game.imageUrl = null;
    } else {
      game.imageUrl = "http://media.steampowered.com/steamcommunity/public/images/apps/" + game.steamid + "/" + game.logo + ".jpg";
    }
  };

  this.updatePlaytimes = function(game) {
    var timeplayed = game.timeplayed;
    var playtime = game.playtime;

    game.aggPlaytime = playtime == null ? timeplayed : playtime / 60;

    var timetotal = game.timetotal;
    var howlong_time = game.howlong_main;

    game.aggTimetotal = timetotal == null ? howlong_time : timetotal;
  };

  this.updatePlatforms = function(game) {
    var found = platforms.some(function (g1) {
      return g1 === game.platform;
    });
    if (!found) {
      platforms.push(game.platform);
    }
  };
}

angular.module('mediaMogulApp')
  .service('GamesService', ['$log', '$http', GamesService]);