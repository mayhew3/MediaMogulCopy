module.exports = function(app) {
  var jwt = require('express-jwt');
  var games = require('../controllers/games_controller');
  var series = require('../controllers/series_controller');

  var authCheck = jwt({
    secret: new Buffer(process.env.AUTH0_CLIENT_SECRET, 'base64'),
    audience: process.env.AUTH0_CLIENT_ID
  });

  // GENERIC API
  app.get('/api/public', function(req, res) {
    res.json({ message: "Hello from a public endpoint! You don't need to be authenticated to see this." });
  });

  app.get('/api/private', authCheck, function(req, res) {
    res.json({ message: "Hello from a private endpoint! You DO need to be authenticated to see this." });
  });

  // GAMES
  app.get('/api/games', authCheck, games.getGames);

  app.post('/api/updategame', authCheck, games.updateGame);
  app.post('/api/addgame', authCheck, games.addGame);

  // TV
  app.get('/seriesList', series.getSeries);
  app.get('/episodeGroupRatings', series.getEpisodeGroupRatings);
  app.get('/episodeList', series.getEpisodes);
  app.get('/recordingNow', series.getRecordingNow);
  app.get('/possibleMatches', series.getPossibleMatches);
  app.get('/viewingLocations', series.getViewingLocations);
  app.get('/seriesViewingLocations', series.getSeriesViewingLocations);
  app.get('/unmatchedEpisodes', series.getUnmatchedEpisodes);
  app.get('/upcomingEpisodes', series.getUpcomingEpisodes);

  app.post('/updateEpisode', series.updateEpisode);
  app.post('/updateMultiEpisodes', series.updateMultipleEpisodes);
  app.post('/markAllWatched', series.markAllEpisodesAsWatched);
  app.post('/matchTiVoEpisodes', series.matchTiVoEpisodes);
  app.post('/unlinkEpisode', series.unlinkEpisode);
  app.post('/retireTiVoEpisode', series.retireTiVoEpisode);
  app.post('/changeTier', series.changeTier);
  app.post('/addSeries', series.addSeries);
  app.post('/updateSeries', series.updateSeries);
  app.post('/updateEpisodeGroupRating', series.updateEpisodeGroupRating);
  app.post('/addViewingLocation', series.addViewingLocation);
  app.post('/removeViewingLocation', series.removeViewingLocation);
  app.post('/changeEpisodesStreaming', series.changeEpisodesStreaming);
  app.post('/addRating', series.addRating);
  app.post('/updateRating', series.updateRating);

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
