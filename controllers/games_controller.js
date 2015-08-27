var pg = require('pg');

exports.getGames = function (request, response) {
  var results = [];

  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    var query = client.query('SELECT logo, game, steamid FROM games WHERE logo is not null ORDER BY playtime DESC');

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