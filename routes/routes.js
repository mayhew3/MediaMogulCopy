module.exports = function(app) {
  var jwt = require('express-jwt');
  var games = require('../controllers/games_controller');

  var authCheck = jwt({
    secret: new Buffer(process.env.AUTH0_CLIENT_SECRET, 'base64'),
    audience: process.env.AUTH0_CLIENT_ID
  });

  app.get('/api/games', games.getGames);

  app.get('/api/public', function(req, res) {
    res.json({ message: "Hello from a public endpoint! You don't need to be authenticated to see this." });
  });

  app.get('/api/private', authCheck, function(req, res) {
    res.json({ message: "Hello from a private endpoint! You DO need to be authenticated to see this." });
  });

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
