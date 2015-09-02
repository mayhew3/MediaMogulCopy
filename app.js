var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var app = express();

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
var sessionMiddleware = session({
  resave: true,
  saveUninitialized: true,
  cookie:{maxAge:1000*3600*24*7}, //remember for 7 days
  secret: process.env.MEDIAMOGULSECRET
});
app.use(sessionMiddleware);
app.use('/', express.static(path.join(__dirname, 'public')));

require('./routes/routes.js')(app);

module.exports = app;