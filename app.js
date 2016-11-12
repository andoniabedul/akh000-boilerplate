// DEPENDENCIES
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// ROUTES
var routes = require('./routes/index');
var users = require('./routes/users');

// DATABASE
var mongoose = require('mongoose');

// MODELS
var user = require('./model/user');

// ENV VARIABLES
var nconf = require('nconf');
nconf.file('./config/data.json');

// CHANGE THE ENVIRONMENT HERE
nconf.set('env','development');

var app = express();
var router = express.Router();

// VIEW ENGINE
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true,
  sourceMap: true
}));

// PUBLIC DIRECTORY
app.use(express.static(path.join(__dirname, 'public')));

// ROUTES
app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// DEVELOPMENT CONFIG
if(nconf.get('env') === 'development'){
  // DEVELOPMENT ERROR HANDLER SHOW ERRORS
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
  console.log("\n ##########");
  console.log("Connecting with DEVELOPMENT database on mongodb://localhost:" + nconf.get('development:database'));
  console.log("Launching DEVELOPMENT environment on http://localhost:" + nconf.get('development:PORT'));
  console.log("##########\n");
  mongoose.connect('mongodb://localhost/'+ nconf.get('development:database'));
  app.listen(nconf.get('development:PORT'));
} else if (nconf.get('env') === 'production'){
  // PRODUCTION ERROR HANDLER DON'T SHOW ERRORS
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {}
    });
  });
  console.log("\n##########");
  console.log("Connecting with DEVELOPMENT database on mongodb://localhost:" + nconf.get('production:database'));
  console.log("Launching DEVELOPMENT environment on http://localhost:" + nconf.get('production:PORT'));
  console.log("##########\n");
  mongoose.connect('mongodb://localhost/'+ nconf.get('production:database'));
  app.listen(nconf.get('production:PORT'));
}

module.exports = app;
