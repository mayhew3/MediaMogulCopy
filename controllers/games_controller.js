var pg = require('pg');
var passport = require('passport'), LocalStrategy = require('passport-local').Strategy;


passport.use(new LocalStrategy(
  function(username, password, done) {
    pg.connect(process.env.DATABASE_URL, function(err, client) {
      var queryConfig = {
        text: 'SELECT id, password FROM users WHERE username = $1',
        values: [username]
      };

      console.log("SQL: " + queryConfig.text);
      console.log("User: " + queryConfig.values);

      var query = client.query(queryConfig);

      var rows = [];

      query.on('row', function(row) {
        rows.push(row);
      });

      query.on('end', function() {
        console.log("Found end.");
        client.end();
        if (rows.length == 1) {
          var row = rows[0];
          if (row.password == password) {
            console.log("Correct password!");
            return done(null, {id: row.id, username: username});
          } else {
            console.error("Incorrect password.");
            return done(null, false, {message: 'Incorrect password'});
          }
        } else {
          return done(null, false, {message: 'Incorrect user'});
        }
      });

      if (err) {
        console.log("Other error.");
        return done(err);
      }

    });
  }
));

passport.serializeUser(function(user, done) {
  console.log("User id: " + user.id + ", username: " + user.username);
  done(null, user.id);
});

passport.deserializeUser(function(username, done) {
  pg.connect(process.env.DATABASE_URL, function(err, client) {
    var queryConfig = {
      text: 'SELECT username FROM users WHERE id = $1',
      values: [username]
    };

    console.log("SQL: " + queryConfig.text);
    console.log("User: " + queryConfig.values);

    var query = client.query(queryConfig);

    var rows = [];

    query.on('row', function(row) {
      rows.push(row);
    });

    query.on('end', function() {
      console.log("Found end.");
      client.end();
      if (rows.length == 1) {
        var row = rows[0];
        return done(null, {id: username, username: row.username});
      } else {
        return done(null, null);
      }
    });

    if (err) {
      console.log("Other error.");
      return done(err);
    }

  });
});


/**
 * Generic require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
  console.log("User variable: " + req.user);
  if (!req.isAuthenticated()) {
    console.log("Not logged in!");
    return res.send(401, 'User is not authorized');
  }
  console.log("Logged in!");
  next();
};

/**
 * Logout
 */
exports.signout = function(req, res) {
  console.log('Logout: { id: ' + req.user.id + ', username: ' + req.user.username + '}');
  req.logout();
  res.redirect('/');
};


exports.getGames = function (request, response) {
  var results = [];

  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    var query = client.query('SELECT id, logo, title, steamid, playtime, metacritic, platform, owned, metacritic_hint, mayhew, ' +
                                      'timeplayed, timetotal, finished, finalscore, replay, guess, ' +
                                      'giantbomb_icon_url, giantbomb_medium_url, giantbomb_screen_url, giantbomb_small_url, giantbomb_super_url, giantbomb_thumb_url, giantbomb_tiny_url ' +
                              'FROM games ' +
                              'WHERE metacritic is not null AND owned IN (\'owned\', \'borrowed\')' +
                              'ORDER BY metacritic DESC, playtime DESC, added DESC');

    query.on('row', function(row) {
      results.push(row);
    });

    query.on('end', function() {
      client.end();
      return response.json(results);
    });

    if (err) {
      console.error(err); response.send("Error " + err);
    }

  });
};

exports.updateGame = function(request, response) {
  console.log("Updating game with " + JSON.stringify(request.body.ChangedFields));
  console.log("User: " + request.user);

  var sql = "UPDATE games SET ";
  var values = [];
  var i = 1;
  var changedFields = request.body.ChangedFields;
  for (var key in changedFields) {
    if (changedFields.hasOwnProperty(key)) {
      if (values.length != 0) {
        sql += ", ";
      }

      sql += (key + " = $" + i);

      var value = changedFields[key];
      values.push(value);

      i++;
    }
  }

  sql += (" WHERE id = $" + i);

  values.push(request.body.GameId);

  console.log("SQL: " + sql);
  console.log("Values: " + values);

  pg.connect(process.env.DATABASE_URL, function(err, client) {
    var queryConfig = {
      text: sql,
      values: values
    };

    var query = client.query(queryConfig);

    query.on('end', function() {
      client.end();
      return response.json({msg: "Success"});
    });

    if (err) {
      console.error(err); response.send("Error " + err);
    }
  });

};