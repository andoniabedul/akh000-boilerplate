// DEPENDENCIES
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const auth = require('./middleware/auth');

// MIDDLEWARE VALIDATOR
const expressValidator = require('express-validator');

// DATABASE
const mongoose = require('mongoose');

// AUTHENTICATION
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// ROUTES
const root = require('./routes/root');
const users = require('./routes/users');

// MODELS
const User = require('./model/user');

// CONFIG
const config = require('./config/env.json')[process.env.NODE_ENV || 'development'];

const app = express();
const router = express.Router();

// VALIDATOR
app.use(expressValidator());

// VIEW ENGINE
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

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

app.use(require('express-session')({
    secret: 'M4LD1T0-G0RD0-C0MUN1ST4',
    resave: false,
    saveUninitialized: true
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
  res.locals.user = (req.user)? req.session.passport.user : '';
  next();
})

// ROUTES
app.use('/', root);
app.use('/users', users);

// PASSPORT LOCAL STRATEGY
passport.use(new LocalStrategy(auth.authenticate));
passport.serializeUser(auth.serializeUser);
passport.deserializeUser(auth.deserializeUser);

// CATCH 404 ERROR HANDLER
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

console.log(
  `\n->  Launching environment on:
    ${config.server}
    ##########################################
    ******** LAUNCHING ${config.titles.app} ********
    ##########################################
    Connecting database on:
    ${config.mongo_uri} + ${config.database}
    ##########################################\n`
);

// LAUNCH CONNECTION WITH DATABASE
mongoose.connect(config.mongo_uri + config.database);
// LAUNCH THE APP ON THE LISTENING PORT
app.listen(config.port);

module.exports = app;
