module.exports = function(app) {
  var jwt = require('express-jwt');
  var games = require('../controllers/games_controller');
  var series = require('../controllers/series_controller');

  var authCheck = jwt({
    secret: new Buffer(process.env.AUTH0_CLIENT_SECRET, 'base64'),
    audience: process.env.AUTH0_CLIENT_ID
  });

  // GAMES
  app.get('/api/games', authCheck, games.getGames);

  app.post('/api/updategame', authCheck, games.updateGame);
  app.post('/api/addgame', authCheck, games.addGame);

  // TV
  app.get('/seriesList', authCheck, series.getSeries);
  app.get('/seriesMatchList', authCheck, series.getSeriesWithPossibleMatchInfo);
  app.get('/episodeGroupRatings', authCheck, series.getEpisodeGroupRatings);
  app.get('/episodeList', authCheck, series.getEpisodes);
  app.get('/recordingNow', authCheck, series.getRecordingNow);
  app.get('/possibleMatches', authCheck, series.getPossibleMatches);
  app.get('/viewingLocations', authCheck, series.getViewingLocations);
  app.get('/allPosters', authCheck, series.getAllPosters);
  app.get('/seriesViewingLocations', authCheck, series.getSeriesViewingLocations);
  app.get('/unmatchedEpisodes', authCheck, series.getUnmatchedEpisodes);
  app.get('/upcomingEpisodes', authCheck, series.getUpcomingEpisodes);

  app.post('/updateEpisode', authCheck, series.updateEpisode);
  app.post('/markAllWatched', authCheck, series.markAllEpisodesAsWatched);
  app.post('/matchTiVoEpisodes', authCheck, series.matchTiVoEpisodes);
  app.post('/unlinkEpisode', authCheck, series.unlinkEpisode);
  app.post('/retireTiVoEpisode', authCheck, series.retireTiVoEpisode);
  app.post('/ignoreTiVoEpisode', authCheck, series.ignoreTiVoEpisode);
  app.post('/changeTier', authCheck, series.changeTier);
  app.post('/addSeries', authCheck, series.addSeries);
  app.post('/updateSeries', authCheck, series.updateSeries);
  app.post('/updateEpisodeGroupRating', authCheck, series.updateEpisodeGroupRating);
  app.post('/addViewingLocation', authCheck, series.addViewingLocation);
  app.post('/removeViewingLocation', authCheck, series.removeViewingLocation);
  app.post('/changeEpisodesStreaming', authCheck, series.changeEpisodesStreaming);
  app.post('/addRating', authCheck, series.addRating);
  app.post('/updateRating', authCheck, series.updateRating);

  // error handlers

  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
      console.log(err.message);
      console.log(err.stack);
      res.status(err.status || 500).json('error', {
        message: err.message,
        error: err
      });
    });
  }

  // production error handler
  // no stacktraces leaked to user
  app.use(function (err, req, res, next) {
    res.status(err.status || 500).json('error', {
      message: err.message,
      error: {}
    });
  });
};
