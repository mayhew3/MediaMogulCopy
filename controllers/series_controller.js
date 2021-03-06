var pg = require('pg');
const config = process.env.DATABASE_URL;

exports.getSeriesWithPossibleMatchInfo = function(request, response) {
  console.log("Series with Matches call received.");

  var sql = 'SELECT s.*, psm.tvdb_series_title, psm.poster as poster ' +
      'FROM series s ' +
      'LEFT OUTER JOIN possible_series_match psm ' +
      '  ON (psm.series_id = s.id AND psm.tvdb_series_ext_id = s.tvdb_match_id) ' +
      'WHERE s.suggestion = $1 ' +
      'AND s.tvdb_match_status <> $2 ' +
      'AND s.retired = $3 ' +
      'ORDER BY s.title';

  return executeQueryWithResults(response, sql, [false, 'Match Completed', 0]);
};

exports.getNumberOfShowsToRate = function(request, response) {
  var year = request.query.Year;

  console.log("NumberOfShowsToRate called with year " + year);

  var sql = 'select count(1) as num_shows ' +
  'from episode_group_rating ' +
  'where year = $1 ' +
  "and (next_air_date is null or next_air_date > now() + interval '3 months') " +
  'and (watched = aired or watched > $2) ' +
  'and rating is null ';

  return executeQueryWithResults(response, sql, [year, 4]);
};

exports.getNumberOfPendingMatches = function(request, response) {
  var sql = 'SELECT COUNT(1) AS num_matches ' +
    'FROM series ' +
    'WHERE suggestion = $1 ' +
    'AND retired = $2 ' +
    'AND tvdb_match_status IN ($3, $4) ';

  return executeQueryWithResults(response, sql, [false, 0, 'Needs Confirmation', 'Duplicate']);
};

exports.getEpisodeGroupRating = function(request, response) {
  var seriesId = request.query.SeriesId;
  var year = request.query.Year;

  console.log("Received call for episode group rating for series " + seriesId + ", year " + year);

  var sql = 'SELECT * ' +
    'FROM episode_group_rating ' +
    'WHERE year = $1 ' +
    'AND retired = $2 ' +
    'AND series_id = $3 ';

  return executeQueryWithResults(response, sql, [year, 0, seriesId]);
};

exports.getEpisodeGroupRatings = function(request, response) {
  var year = request.query.Year;

  var sql = 'SELECT s.title, s.poster, egr.* ' +
    'FROM episode_group_rating egr ' +
    'INNER JOIN series s ' +
    ' ON egr.series_id = s.id ' +
    'WHERE year = $1 ' +
    'AND s.retired = $2 ';

  return executeQueryWithResults(response, sql, [year, 0]);
};

exports.getAllRatingYears = function(request, response) {
  var sql = 'SELECT DISTINCT year ' +
    'FROM episode_group_rating ' +
    'WHERE retired = $1 ' +
    'ORDER BY year DESC ';

  return executeQueryWithResults(response, sql, [0]);
};

exports.getEpisodes = function(req, response) {
  console.log("Episode call received. Params: " + req.query.SeriesId);

  var sql = 'SELECT e.*, ' +
      'te.episode_number as tvdb_episode_number, ' +
      'te.name as tvdb_episode_name, ' +
      'te.filename as tvdb_filename, ' +
      'te.overview as tvdb_overview, ' +
      'te.production_code as tvdb_production_code, ' +
      'te.rating as tvdb_rating, ' +
      'te.director as tvdb_director, ' +
      'te.writer as tvdb_writer, ' +
      'ti.deleted_date as tivo_deleted_date, ' +
      'ti.suggestion as tivo_suggestion, ' +
      'ti.showing_start_time as showing_start_time, ' +
      'ti.episode_number as tivo_episode_number, ' +
      'ti.title as tivo_title, ' +
      'ti.description as tivo_description, ' +
      'ti.id as tivo_episode_id,' +
      'ti.station as tivo_station,' +
      'ti.channel as tivo_channel,' +
      'ti.rating as tivo_rating,' +
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
      'LEFT OUTER JOIN tivo_episode ti ' +
      ' ON ete.tivo_episode_id = ti.id ' +
      'LEFT OUTER JOIN episode_rating er ' +
      ' ON er.episode_id = e.id ' +
      'WHERE e.series_id = $1 ' +
      'AND e.retired = $2 ' +
      'AND te.retired = $3 ' +
      'ORDER BY e.season, e.episode_number, ti.id';

  return executeQueryWithResults(response, sql, [req.query.SeriesId, 0, 0]);
};

exports.getRecordingNow = function(req, response) {
  var sql = 'SELECT e.series_id ' +
      'FROM tivo_episode te ' +
      'INNER JOIN edge_tivo_episode ete ' +
      ' ON ete.tivo_episode_id = te.id ' +
      'INNER JOIN episode e ' +
      ' ON ete.episode_id = e.id ' +
      'WHERE te.recording_now = $1 ';

  return executeQueryWithResults(response, sql, [true]);
};

exports.getPossibleMatches = function(req, response) {
  console.log("Possible matches call received. Params: " + req.query.SeriesId);

  var sql = 'SELECT psm.* ' +
      'FROM possible_series_match psm ' +
      'WHERE psm.series_id = $1 ' +
      'AND psm.retired = $2 ';

  return executeQueryWithResults(response, sql, [req.query.SeriesId, 0]);
};

exports.getViewingLocations = function(req, response) {
  console.log("Getting all possible viewing locations.");

  var sql = 'SELECT * FROM viewing_location';

  return executeQueryWithResults(response, sql, []);
};

exports.getAllPosters = function(req, response) {
  var tvdbSeriesId = req.query.tvdb_series_id;
  console.log("All Posters call received. Params: {SeriesId: " + tvdbSeriesId + "}");

  var sql = 'SELECT poster_path ' +
    'FROM tvdb_poster ' +
    'WHERE tvdb_series_id = $1 ' +
    'AND retired = $2 ';
  return executeQueryWithResults(response, sql, [tvdbSeriesId, 0]);
};

exports.getUnmatchedEpisodes = function(req, response) {
  console.log("Unmatched Episode call received. Params: " + req.query.TiVoSeriesId);

  var sql = 'SELECT te.* ' +
      'FROM tivo_episode te ' +
      'WHERE te.tivo_series_v2_ext_id = $1 ' +
      'AND te.retired = $2 ' +
      'AND te.ignore_matching = $3 ' +
      'AND id not in (select ete.tivo_episode_id from edge_tivo_episode ete)';

  return executeQueryWithResults(response, sql, [req.query.TiVoSeriesId, 0, false]);
};

exports.getTVDBErrors = function(req, response) {
  console.log("TVDB Errors request received.");

  var sql = 'SELECT * ' +
    'FROM tvdb_update_error ' +
    'ORDER BY id DESC ';

  return executeQueryWithResults(response, sql, []);
};

exports.getPrimeTV = function(req, response) {
  console.log("PrimeTV endpoint called.");

  var sql = 'SELECT s.id, ' +
    's.title, ' +
    'ps.rating as my_rating, ' +
    's.metacritic, ' +
    's.poster, ' +
    'ps.unwatched_episodes as unwatched, ' +
    'ps.first_unwatched ' +
    'FROM series s ' +
    'INNER JOIN person_series ps ' +
    ' ON ps.series_id = s.id ' +
    'WHERE ps.tier = $1 ' +
    'AND ps.unwatched_episodes > $2 ' +
    'AND s.tvdb_match_status = $3 ' +
    'AND s.retired = $4 ' +
    'AND ps.person_id = $5 ' +
    'ORDER BY CASE WHEN ps.rating IS NULL THEN s.metacritic ELSE ps.rating END DESC NULLS LAST';

  return executeQueryWithResults(response, sql, [1, 0, 'Match Completed', 0, 1])
};

exports.getPrimeSeriesInfo = function(req, response) {
  console.log("Prime Series Info call received. Params: " + req.query.SeriesId);

  // Items commented out which aren't in iOS UI yet, but could be of use.
  var sql = 'SELECT ' +
    'e.id, ' +
    'e.title, ' +
    'e.season, ' +
    'e.episode_number, ' +
    'e.watched_date, ' +
    'e.air_time, ' +
    'e.on_tivo, ' +
    // 'e.streaming, ' +
    'te.filename as tvdb_filename, ' +
    'te.overview as tvdb_overview ' +
    // 'ti.deleted_date as tivo_deleted_date, ' +
    // 'er.rating_funny, ' +
    // 'er.rating_character, ' +
    // 'er.rating_story, ' +
    // 'er.rating_value, ' +
    // 'er.review, ' +
    // 'er.id as rating_id ' +
    'FROM episode e ' +
    'LEFT OUTER JOIN tvdb_episode te ' +
    ' ON e.tvdb_episode_id = te.id ' +
    'WHERE e.series_id = $1 ' +
    'AND e.retired = $2 ' +
    'AND te.retired = $3 ' +
    'AND e.season <> $4 ' +
    'AND e.id NOT IN (SELECT episode_id FROM episode_rating WHERE person_id = $5 AND watched = $6 AND retired = $7) ' +
    'ORDER BY e.season, e.episode_number ' +
    'LIMIT 1 ';

  return executeQueryWithResults(response, sql, [
    req.query.SeriesId,
    0,    // e.retired
    0,    // te.retired
    0,    // e.season
    1,    // er.person_id
    true, // er.watched
    0]);  // er.watched
};

exports.changeTier = function(req, response) {
  var tier = req.body.tier;
  var seriesId = req.body.SeriesId;

  console.log("Updating series " + seriesId + " to Tier " + tier);

  var sql = "UPDATE series SET tier = $1 WHERE id = $2";

  executeQueryNoResults(response, sql, [tier, seriesId]);
};

exports.addSeries = function(req, res) {
  console.log("Entered addSeries server call: " + JSON.stringify(req.body.series));

  var seriesObj = req.body.series;

  return insertSeries(seriesObj, res);
};

var insertSeries = function(series, response) {
  console.log("Inserting series.");

  var sql = "INSERT INTO series (" +
      "title, tier, metacritic, mayhew_rating, date_added, tvdb_new, metacritic_new, tvdb_match_status, person_id) " +
      "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) " +
      "RETURNING id ";
  var values = [
    series.title,
    series.tier,
    series.metacritic,
    series.mayhew_rating,
    new Date,
    true,
    true,
    'Match First Pass',
    series.person_id
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
      console.log("series insert successful.");

      // NOTE: This only works because the query has "RETURNING id" at the end.
      series.id = result.rows[0].id;

      console.log("series id found: " + series.id);
      return insertSeriesViewingLocation(series.id, series.ViewingLocations[0].id, response);
    });

  });

};

exports.getSeriesViewingLocations = function(req, response) {
  console.log("Series Viewing Locations call received. Params: " + req.query.SeriesId);

  var seriesId = req.query.SeriesId;

  var sql = 'SELECT vl.* ' +
      'FROM series_viewing_location svl ' +
      'INNER JOIN viewing_location vl ' +
      ' ON svl.viewing_location_id = vl.id ' +
      'WHERE svl.series_id = $1';

  return executeQueryWithResults(response, sql, [seriesId]);
};

exports.addViewingLocation = function(req, response) {
  return insertSeriesViewingLocation(req.body.SeriesId, req.body.ViewingLocationId, response);
};

exports.removeViewingLocation = function(req, response) {
  var seriesId = req.body.SeriesId;
  var viewingLocationId = req.body.ViewingLocationId;

  var sql = "DELETE FROM series_viewing_location " +
      "WHERE series_id = $1 AND viewing_location_id = $2";

  return executeQueryNoResults(response, sql, [seriesId, viewingLocationId]);
};

var insertSeriesViewingLocation = function(seriesId, viewingLocationId, response) {

  console.log("Adding viewing_location " + viewingLocationId + " to series " + seriesId);

  var sql = 'INSERT INTO series_viewing_location (series_id, viewing_location_id, date_added) ' +
      'VALUES ($1, $2, now())';

  return executeQueryNoResults(response, sql, [seriesId, viewingLocationId]);
};

exports.changeEpisodesStreaming = function(req, response) {
  var seriesId = req.body.SeriesId;
  var streaming = req.body.Streaming;

  console.log("Updating episodes of series " + seriesId + " to streaming: " + streaming);

  var sql = "UPDATE episode " +
      "SET streaming = $1 " +
      "WHERE series_id = $2 " +
      "AND season <> $3 " +
      "AND retired = $4 ";

  return executeQueryNoResults(response, sql, [streaming, seriesId, 0, 0]);
};

exports.updateSeries = function(req, response) {
  console.log("Update Series with " + JSON.stringify(req.body.ChangedFields));

  var queryConfig = buildUpdateQueryConfig(req.body.ChangedFields, "series", req.body.SeriesId);

  console.log("SQL: " + queryConfig.text);
  console.log("Values: " + queryConfig.values);

  return executeQueryNoResults(response, queryConfig.text, queryConfig.values);
};

exports.updateEpisode = function(req, response) {
  console.log("Update Episode with " + JSON.stringify(req.body.ChangedFields));

  var queryConfig = buildUpdateQueryConfig(req.body.ChangedFields, "episode", req.body.EpisodeId);

  console.log("SQL: " + queryConfig.text);
  console.log("Values: " + queryConfig.values);

  return executeQueryNoResults(response, queryConfig.text, queryConfig.values);
};

exports.updateEpisodeGroupRating = function(req, response) {
  console.log("Update EpisodeGroupRating with " + JSON.stringify(req.body.ChangedFields));

  var queryConfig = buildUpdateQueryConfig(req.body.ChangedFields, "episode_group_rating", req.body.EpisodeGroupRatingId);

  console.log("SQL: " + queryConfig.text);
  console.log("Values: " + queryConfig.values);

  return executeQueryNoResults(response, queryConfig.text, queryConfig.values);
};

exports.addEpisodeGroupRating = function(request, response) {
  var episodeGroupRating = request.body.EpisodeGroupRating;
  console.log("Add new EpisodeGroupoRating: " + JSON.stringify(episodeGroupRating));

  var sql = "INSERT INTO episode_group_rating (series_id, year, start_date, end_date, avg_rating, max_rating, last_rating, " +
    "suggested_rating, num_episodes, watched, rated, last_aired, avg_funny, avg_story, avg_character, aired, next_air_date, " +
    "post_update_episodes) " +
    "VALUES " +
    "($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) " +
    "RETURNING id ";

  var values = [
    episodeGroupRating.series_id,
    episodeGroupRating.year,
    episodeGroupRating.start_date,
    episodeGroupRating.end_date,
    episodeGroupRating.avg_rating,
    episodeGroupRating.max_rating,
    episodeGroupRating.last_rating,
    episodeGroupRating.suggested_rating,
    episodeGroupRating.num_episodes,
    episodeGroupRating.watched,
    episodeGroupRating.rated,
    episodeGroupRating.last_aired,
    episodeGroupRating.avg_funny,
    episodeGroupRating.avg_story,
    episodeGroupRating.avg_character,
    episodeGroupRating.aired,
    episodeGroupRating.nextAirDate,
    episodeGroupRating.post_update_episodes
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
      console.log("episode group rating insert successful.");

      // NOTE: This only works because the query has "RETURNING id" at the end.
      var rating_id = result.rows[0].id;

      console.log("rating id found: " + rating_id);
      return response.json({RatingId: rating_id});
    });

  });
};

exports.retireTiVoEpisode = function(req, response) {
  console.log("Retiring tivo_episode with id " + req.body.TiVoEpisodeId);

  var sql = 'UPDATE tivo_episode SET retired = id WHERE id = $1';

  return executeQueryNoResults(response, sql, [req.body.TiVoEpisodeId]);
};

exports.ignoreTiVoEpisode = function(req, response) {
  console.log("Ignoring tivo_episode with id " + req.body.TiVoEpisodeId);

  var sql = 'UPDATE tivo_episode SET ignore_matching = true WHERE id = $1';

  return executeQueryNoResults(response, sql, [req.body.TiVoEpisodeId]);
};

exports.matchTiVoEpisodes = function(req, response) {
  var tivoEpisodeId = req.body.TiVoID;
  var tvdbEpisodeIds = req.body.TVDBEpisodeIds;

  insertEdgeRow(tivoEpisodeId, tvdbEpisodeIds).then(function(result, err) {
    if (err) {
      console.error(err);
      return response.send("Error " + err);
    }

    updateOnTivo(tvdbEpisodeIds, true).then(function(result, err) {
      if (err) {
        console.error(err);
        return response.send("Error " + err);
      }

      return updateEpisodeMatchStatus(tivoEpisodeId, "Match Completed", response);
    });
  });

};


exports.unlinkEpisode = function(req, response) {
  var episodeId = req.body.EpisodeId;

  console.log("Unlinking episode: " + episodeId);

  setMatchStatusOnLinkedEpisodes(episodeId, "Match First Pass").then(function(result, err) {
    if (err) {
      console.error("Error setting tivo_episode match status: " + err);
      return response.send(err);
    }

    retireEdgeRows(episodeId).then(function(result, err) {
      if (err) {
        console.error("Error retiring edge rows: " + err);
        return response.send("Error " + err);
      }

      updateOnTivo([episodeId], false).then(function(results, err) {
        if (err) {
          console.error("Error updating OnTivo column: " + err);
          return response.send("Error " + err);
        }

        response.json({msg: "Success!"});
      });
    });
  });
};

exports.addRating = function(req, response) {
  var episodeRating = req.body.EpisodeRating;

  console.log("Adding rating: " + JSON.stringify(episodeRating));

  var sql = "INSERT INTO episode_rating (episode_id, rating_date, rating_funny, rating_character, rating_story, rating_value, review, date_added) " +
      "VALUES ($1, $2, $3, $4, $5, $6, $7, $8) " +
      "RETURNING id";

  var values = [
    episodeRating.episode_id,
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
};

exports.updateRating = function(req, response) {
  var changedFields = req.body.ChangedFields;
  var rating_id = req.body.RatingID;

  console.log("Changing rating: " + JSON.stringify(changedFields));

  var queryConfig = buildUpdateQueryConfig(changedFields, "episode_rating", rating_id);

  console.log("SQL: " + queryConfig.text);
  console.log("Values: " + queryConfig.values);

  return executeQueryNoResults(response, queryConfig.text, queryConfig.values);
};


exports.getUpcomingEpisodes = function(req, response) {
  var sql = "select e.series_id, e.title, e.season, e.episode_number, e.air_date, e.air_time " +
      "from episode e " +
      "inner join series s " +
      "on e.series_id = s.id " +
      "where s.tier = $1 " +
      "and e.air_time is not null " +
      "and e.air_time >= current_timestamp " +
      "and e.watched = $2 " +
      "and e.season <> $3 " +
      "and e.retired = $4 " +
      "order by e.air_time asc;";

  return executeQueryWithResults(response, sql, [1, false, 0, 0]);
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

function insertEdgeRow(tivoEpisodeId, tvdbEpisodeIds) {
  var wildcards = [];
  var index = 1;
  tvdbEpisodeIds.forEach(function() {
    wildcards.push("$" + index);
    index++;
  });

  var wildCardString = wildcards.join(', ');

  console.log("Trying to match TVDB IDs " + tvdbEpisodeIds + " to episode " + tivoEpisodeId);

  var sql = 'INSERT INTO edge_tivo_episode (tivo_episode_id, episode_id) ' +
    'SELECT $' + index + ', id ' +
    'FROM episode ' +
    'WHERE id IN (' + wildCardString + ")";

  var values = tvdbEpisodeIds.slice();
  values.push(tivoEpisodeId);

  console.log("SQL:" + sql);
  console.log("Values:" + values);

  return updateNoJSON(sql, values);
}

function retireEdgeRows(episodeId) {
  console.log("Retiring edge rows to episode " + episodeId);

  var sql = 'DELETE FROM edge_tivo_episode ' +
    'WHERE episode_id = $1 ';

  var values = [episodeId];

  console.log("SQL:" + sql);
  console.log("Values:" + values);

  return updateNoJSON(sql, values);
}

function setMatchStatusOnLinkedEpisodes(episodeId, matchStatus) {
  console.log("Setting match status on episode " + episodeId + " to '" + matchStatus + "'");

  var sql = "UPDATE tivo_episode " +
    "SET tvdb_match_status = $1 " +
    "WHERE tivo_episode.id IN " +
    " (SELECT ete.tivo_episode_id " +
    "  FROM edge_tivo_episode ete " +
    "  WHERE ete.episode_id = $2) " +
    "AND retired = $3";

  var values = [
    matchStatus,
    episodeId,
    0
  ];

  return updateNoJSON(sql, values);
}

function updateOnTivo(tvdbEpisodeIds, onTiVoValue) {
  var wildcards = [];
  var index = 1;
  tvdbEpisodeIds.forEach(function() {
    wildcards.push("$" + index);
    index++;
  });

  var wildCardString = wildcards.join(', ');

  console.log("Trying to update episode.OnTivo column for " + tvdbEpisodeIds + ".");

  var sql = 'UPDATE episode ' +
    'SET on_tivo = $' + index + ' ' +
    'WHERE id IN (' + wildCardString + ")";

  var values = tvdbEpisodeIds.slice();
  values.push(onTiVoValue);

  console.log("SQL:" + sql);
  console.log("Values:" + values);

  return updateNoJSON(sql, values);
}

function updateEpisodeMatchStatus(tivoEpisodeId, matchStatus, response) {
  console.log("Update TiVoEpisode with ID " + tivoEpisodeId + " to new match status " + matchStatus);

  var changedFields = {
    tvdb_match_status: matchStatus
  };

  var queryConfig = buildUpdateQueryConfig(changedFields, "tivo_episode", tivoEpisodeId);

  console.log("SQL: " + queryConfig.text);
  console.log("Values: " + queryConfig.values);

  return executeQueryNoResults(response, queryConfig.text, queryConfig.values);
}

function updateNoJSON(sql, values) {
  return new Promise(function(resolve, reject) {

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
        console.error(err);
        reject(Error(err));
      }

      var query = client.query(queryConfig);

      query.on('end', function() {
        client.end();
        resolve("Success!");
      });

    });

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
