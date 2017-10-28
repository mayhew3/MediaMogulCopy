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

  var sql = "SELECT s.id, " +
    "s.title, " +
    "s.tier, " +
    "s.metacritic, " +
    "s.streaming_episodes, " +
    "s.matched_episodes, " +
    "s.unmatched_episodes, " +
    "s.last_tvdb_update, " +
    "s.last_tvdb_error, " +
    "s.poster, " +
    "s.air_time, " +
    "ps.rating as my_rating, " +
    "ps.unwatched_episodes, " +
    "ps.unwatched_streaming, " +
    "ps.last_unwatched, " +
    "ps.first_unwatched " +
    "FROM series s " +
    "INNER JOIN person_series ps " +
    "  ON ps.series_id = s.id " +
    "WHERE ps.person_id = $1 " +
    "AND s.suggestion = $2 " +
    "AND s.tvdb_match_status = $3 " +
    "AND s.retired = $4 ";
  var values = [
    personId, false, 'Match Completed', 0
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
    "AND e.season <> $2 " +
    "AND e.retired = $3 " +
    "AND ps.tier = $4 " +
    "ORDER BY e.air_time ASC;";

  return executeQueryWithResults(response, sql, [personId, 0, 0, 1]);
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

exports.rateMyShow = function(request, response) {
  var personId = request.body.PersonId;
  var seriesId = request.body.SeriesId;
  var rating = request.body.Rating;

  var sql = "UPDATE person_series " +
    "SET rating = $1, rating_date = NOW() " +
    "WHERE person_id = $2 " +
    "AND series_id = $3 ";

  var values = [
    rating, personId, seriesId
  ];

  return executeQueryNoResults(response, sql, values);
};

exports.getMyEpisodes = function(req, response) {
  console.log("Episode call received. Params: " + req.query.SeriesId + ", Person: " + req.query.PersonId);

  var sql = 'SELECT e.id, ' +
    'e.air_date, ' +
    'e.air_time, ' +
    'e.series_title, ' +
    'e.title, ' +
    'e.season, ' +
    'e.episode_number, ' +
    'e.absolute_number, ' +
    'e.streaming, ' +
    'te.episode_number as tvdb_episode_number, ' +
    'te.name as tvdb_episode_name, ' +
    'te.filename as tvdb_filename, ' +
    'te.overview as tvdb_overview, ' +
    'te.production_code as tvdb_production_code, ' +
    'te.rating as tvdb_rating, ' +
    'te.director as tvdb_director, ' +
    'te.writer as tvdb_writer, ' +
    'er.watched, ' +
    'er.watched_date, ' +
    'er.rating_funny, ' +
    'er.rating_character, ' +
    'er.rating_story, ' +
    'er.rating_value, ' +
    'er.review, ' +
    'er.id as rating_id ' +
    'FROM episode e ' +
    'LEFT OUTER JOIN tvdb_episode te ' +
    ' ON e.tvdb_episode_id = te.id ' +
    'LEFT OUTER JOIN edge_tivo_episode ete ' +
    ' ON e.id = ete.episode_id ' +
    'LEFT OUTER JOIN episode_rating er ' +
    ' ON er.episode_id = e.id ' +
    'WHERE e.series_id = $1 ' +
    'AND e.retired = $2 ' +
    'AND te.retired = $3 ' +
    'AND (er.person_id = $4 OR er.person_id IS NULL) ' +
    'ORDER BY e.season, e.episode_number';

  return executeQueryWithResults(response, sql, [req.query.SeriesId, 0, 0, req.query.PersonId]);
};

exports.rateMyEpisode = function(request, response) {
  if (request.body.IsNew) {
    return addRating(request.body.EpisodeRating, response);
  } else {
    return editRating(request.body.ChangedFields, request.body.RatingId, response);
  }
};

function addRating(episodeRating, response) {
  console.log("Adding rating: " + JSON.stringify(episodeRating));

  var sql = "INSERT INTO episode_rating (episode_id, person_id, watched, watched_date, " +
      "rating_date, rating_funny, rating_character, rating_story, rating_value, " +
      "review, date_added) " +
    "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) " +
    "RETURNING id";

  var values = [
    episodeRating.episode_id,
    episodeRating.person_id,
    episodeRating.watched,
    episodeRating.watched_date,
    new Date,
    episodeRating.rating_funny,
    episodeRating.rating_character,
    episodeRating.rating_story,
    episodeRating.rating_value,
    episodeRating.review,
    new Date
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
      console.log("rating insert successful.");

      // NOTE: This only works because the query has "RETURNING id" at the end.
      var rating_id = result.rows[0].id;

      console.log("rating id found: " + rating_id);
      return response.json({RatingId: rating_id});
    });

  });
}

function editRating(changedFields, rating_id, response) {
  console.log("Changing rating: " + JSON.stringify(changedFields));

  var queryConfig = buildUpdateQueryConfig(changedFields, "episode_rating", rating_id);

  console.log("SQL: " + queryConfig.text);
  console.log("Values: " + queryConfig.values);

  return executeQueryNoResults(response, queryConfig.text, queryConfig.values);
}

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

function buildUpdateQueryConfig(changedFields, tableName, rowID) {

  var sql = "UPDATE " + tableName + " SET ";
  var values = [];
  var i = 1;
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

  values.push(rowID);

  return {
    text: sql,
    values: values
  };
}

