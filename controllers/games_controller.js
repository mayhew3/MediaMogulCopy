var pg = require('pg');

exports.getGames = function (request, response) {
  var results = [];

  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    var query = client.query('SELECT logo, game, steamid, playtime, metacritic, platform, owned, metacritic_hint, mayhew, ' +
                                      '"hrs played" as timeplayed, "hrs total" as timetotal, finished, finalscore, "replay?" as replay ' +
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