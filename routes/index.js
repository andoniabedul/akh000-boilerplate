const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const expressValidator = require('express-validator');
const router = express.Router();
const flash = require('connect-flash');
const User = require('../model/user');


router.get('/', function (req, res) {
    res.render('index', { user : req.user });
});


module.exports = router;
