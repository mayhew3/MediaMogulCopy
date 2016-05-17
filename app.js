var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var bodyParser = require('body-parser');
var session = require('express-session');
var app = express();

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser(process.env.MEDIAMOGULSECRET));
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
  cookie:{
    httpOnly: true,
    maxAge: 1000*3600*24*30
  }
}));
app.use('/', express.static(path.join(__dirname, 'public')));

require('./routes/routes.js')(app);

module.exports = app;