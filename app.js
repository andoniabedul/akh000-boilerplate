// DEPENDENCIES
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

// MIDDLEWAR VALIDATOR
const expressValidator = require('express-validator');
// INFO MESSAGES
const flash = require('connect-flash');
// DATABASE
const mongoose = require('mongoose');

// AUTHENTICATION
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// ROUTES
var routes = require('./routes/index');
var users = require('./routes/users');



// MODELS
var User = require('./model/user');

// ENV VARIABLES
const nconf = require('nconf');
nconf.file('./config/data.json');

// CHANGE THE ENVIRONMENT HERE
nconf.set('env','development');

const app = express();
const router = express.Router();

// VALIDATOR
app.use(expressValidator());

// VIEW ENGINE
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('express-session')({
    secret: 'M4LD1T0-G0RD0-C0MUN1ST4',
    resave: false,
    saveUninitialized: false
}));

// PASSPORT
app.use(passport.initialize());
app.use(passport.session());

// PUBLIC DIRECTORY
app.use(express.static(path.join(__dirname, 'public')));

// FLASH MESSAGES
app.use(function(req, res, next){
  res.locals.success_msg = ''; // SUCCESSFULLY MESSAGES
  res.locals.error_msg = ''; // SINGLE ERROR
  res.locals.errors = ''; // MULTIPLE ERRORS
  res.locals.user = '';
  next();
})

// ROUTES
app.use('/', routes);
app.use('/users', users);



// passport config
//passport.use(new //LocalStrategy(User.authenticate()));
//passport.serializeUser(User.serializeUser());
//passport.deserializeUser(User.deserializeUser());

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
