var pg = require('pg');
var config = process.env.DATABASE_URL;

exports.getPersonInfo = function(request, response) {
  var email = request.query.email;
  console.log("User call received: " + email);

  var sql = 'SELECT p.* ' +
          'FROM person p ' +
          'WHERE p.email = $1 ' +
          'AND p.retired = $2 ';

  return executeQueryWithResults(response, sql, [email, 0]);
};

exports.addPerson = function(request, response) {
  var person = request.body.Person;

  var sql = "INSERT INTO person " +
          "(email, first_name, last_name) " +
          "VALUES ($1, $2, $3) " +
          "RETURNING id ";
  var values = [
    person.email,
    person.first_name,
    person.last_name
  ];

  var queryConfig = {
    text: sql,
    values: values
  };

  var client = new pg.Client(config);
  if (client === null) {
    return console.error('null client');
  }

  client.connect(function(err) {
    if (err) {
      return console.error('could not connect to postgres', err);
    }

    client.query(queryConfig, function(err, result) {
      if (err) {
        console.error(err);
        response.send("Error " + err);
      }
      console.log("person insert successful.");

      // NOTE: This only works because the query has "RETURNING id" at the end.
      var person_id = result.rows[0].id;

      console.log("person id found: " + person_id);
      return response.json({PersonId: person_id});
    });

  });
};

exports.getMyShows = function(request, response) {
  var personId = request.query.PersonId;
  console.log("Server call: Person " + personId);

  var sql = "SELECT s.* " +
    "FROM series s " +
    "INNER JOIN person_series ps " +
    "  ON ps.series_id = s.id " +
    "WHERE ps.person_id = $1 " +
    "AND s.retired = $2 ";
  var values = [
    personId, 0
  ];

  return executeQueryWithResults(response, sql, values);
};

exports.getMyUpcomingEpisodes = function(request, response) {
  var personId = request.query.PersonId;

  var sql = "SELECT e.series_id, e.title, e.season, e.episode_number, e.air_date, e.air_time " +
    "FROM episode e " +
    "INNER JOIN series s " +
    "  ON e.series_id = s.id " +
    "INNER JOIN person_series ps " +
    "  ON ps.series_id = s.id " +
    "WHERE ps.person_id = $1 " +
    "AND e.air_time is not null " +
    "AND e.air_time >= current_timestamp " +
    "AND e.watched = $2 " +
    "AND e.season <> $3 " +
    "AND e.retired = $4 " +
    "ORDER BY e.air_time ASC;";

  return executeQueryWithResults(response, sql, [personId, false, 0, 0]);
};

exports.addToMyShows = function(request, response) {
  var personId = request.body.PersonId;
  var seriesId = request.body.SeriesId;

  var sql = "INSERT INTO person_series " +
    "(person_id, series_id, tier) " +
    "VALUES ($1, $2, $3) ";
  var values = [
    personId, seriesId, 1
  ];

  return executeQueryNoResults(response, sql, values);
};

exports.removeFromMyShows = function(request, response) {
  var personId = request.body.PersonId;
  var seriesId = request.body.SeriesId;
  console.log("Server call 'removeFromMyShows': Person " + personId + ", Series " + seriesId);

  var sql = "DELETE FROM person_series " +
    "WHERE person_id = $1 " +
    "AND series_id = $2 ";
  var values = [
    personId, seriesId
  ];

  return executeQueryNoResults(response, sql, values);
};


exports.getNotMyShows = function(request, response) {
  var personId = request.query.PersonId;
  console.log("Server call 'getNotMyShows': Person " + personId);

  var sql = "SELECT s.* " +
    "FROM series s " +
    "WHERE id NOT IN (SELECT ps.series_id " +
    "                 FROM person_series ps " +
    "                 WHERE person_id = $1) " +
    "AND s.retired = $2 " +
    "AND s.tier = $3 ";
  var values = [
    personId, 0, 1
  ];

  return executeQueryWithResults(response, sql, values);
};


// utility methods


function executeQueryWithResults(response, sql, values) {
  var results = [];

  var queryConfig = {
    text: sql,
    values: values
  };

  var client = new pg.Client(config);
  if (client === null) {
    return console.error('null client');
  }

  client.connect(function(err) {
    if (err) {
      return console.error('could not connect to postgres', err);
    }

    var query = client.query(queryConfig);

    query.on('row', function(row) {
      results.push(row);
    });

    query.on('end', function() {
      client.end();
      return response.json(results);
    });

    if (err) {
      console.error(err);
      response.send("Error " + err);
    }
  })
}


function executeQueryNoResults(response, sql, values) {

  var queryConfig = {
    text: sql,
    values: values
  };

  var client = new pg.Client(config);
  if (client === null) {
    return console.error('null client');
  }

  client.connect(function(err) {
    if (err) {
      return console.error('could not connect to postgres', err);
    }

    var query = client.query(queryConfig);

    query.on('end', function() {
      client.end();
      return response.json({msg: "Success"});
    });

    if (err) {
      console.error(err);
      response.send("Error " + err);
    }
  });
}

