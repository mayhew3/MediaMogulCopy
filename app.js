var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');
var favicon = require('serve-favicon');
var app = express();

app.use(favicon(__dirname + '/public/images/favicon.ico', {}));
app.use(logger('dev'));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser(process.env.MEDIAMOGULSECRET));
app.use('/', express.static(path.join(__dirname, 'public')));


require('./routes/routes.js')(app);

module.exports = app;