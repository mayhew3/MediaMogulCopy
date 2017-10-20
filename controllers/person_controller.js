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

  var sql = "INSERT INTO person (" +
          "email, first_name, last_name) " +
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

exports.linkPersonWithSeries = function(request, response) {

};

exports.unlinkPersonFromSeries = function(request, response) {

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
