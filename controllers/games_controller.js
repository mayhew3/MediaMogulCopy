var pg = require('pg');

exports.getGames = function (request, response) {
  var results = [];

  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    var query = client.query('SELECT id, logo, title, steamid, playtime, metacritic, platform, owned, metacritic_hint, mayhew, ' +
                                      'timeplayed, timetotal, finished, finalscore, replay ' +
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

  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
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