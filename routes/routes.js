module.exports = function(app) {
  var passport = require('passport');
  app.use(passport.initialize());
  app.use(passport.session());

  var games = require('../controllers/games_controller');


  app.get('/api/games', games.getGames);
  app.get('/signout', games.signout);

  app.post('/api/updategame', games.requiresLogin, games.updateGame);
  app.post('/api/addgame', games.requiresLogin, games.addGame);
  app.post('/login', function(req, res, next) {

    passport.authenticate('local',
      function (err, user, info) {
        if (err) {
          return res.json({message: "Error: " + err.message});
        }

        if (!user) {
          return res.json({message: "Error: " + info.message});
        }

        // todo: this was a long shot. try removing once the issue is resolved.
        res.header('Access-Control-Allow-Credentials', true);

        return req.logIn(user, function (err) {
          console.log("Login success? User: " + user);
          if (err) {
            return res.json({message: "Error: " + err.message});
          } else {
            return res.redirect('/');
          }
        })
      })(req, res, next);
  });

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
