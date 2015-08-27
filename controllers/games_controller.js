var pg = require('pg');

exports.getGames = function (request, response) {
  var results = [];

  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    var query = client.query('SELECT id, game FROM games');

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