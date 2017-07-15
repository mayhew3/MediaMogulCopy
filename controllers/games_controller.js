var pg = require('pg');
const config = process.env.DATABASE_URL;

exports.getGames = function (request, response) {
  var results = [];

  pg.connect(config, function(err, client) {
    var query = client.query('SELECT id, logo, title, steamid, playtime, metacritic, platform, owned, metacritic_hint, mayhew, ' +
                                      'timeplayed, timetotal, finished, finalscore, replay, guess, date_added, ' +
                                      'steam_cloud, ' +
                                      'giantbomb_small_url, giantbomb_thumb_url, giantbomb_medium_url, howlong_main, ' +
                                      'howlong_id, giantbomb_id, giantbomb_manual_guess ' +
                              'FROM games ' +
                              'WHERE owned IN (\'owned\', \'borrowed\') ' +
                              'ORDER BY metacritic DESC, playtime DESC, date_added DESC');

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
      if (values.length !== 0) {
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

  pg.connect(config, function(err, client) {
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

exports.addGame = function(request, response) {
  var game = request.body.game;
  console.log("Adding game with " + JSON.stringify(game));
  console.log("User: " + request.user);

  var sql = "INSERT INTO games (title, platform, mayhew, owned, date_added) VALUES ($1, $2, $3, $4, $5)";
  var values =
    [game.title,
    game.platform,
    game.mayhew,
    game.owned,
    game.date_added];

  console.log("SQL: " + sql);
  console.log("Values: " + values);

  pg.connect(config, function(err, client) {
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