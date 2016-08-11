module.exports = function(app) {
  var games = require('../controllers/games_controller');

  app.get('/api/games', games.getGames);

  app.post('/api/updategame', games.updateGame);
  app.post('/api/addgame', games.addGame);

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
