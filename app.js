var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var dotenv = require('dotenv');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var cookieSession = require('cookie-session');


var index = require('./routes/index');
var s = require('./routes/s');
var rooms = require('./routes/rooms');
var api = require('./routes/api');
var authenticate = require('./routes/authenticate');
var dashboard = require('./routes/dashboard');
var edit = require('./routes/edit');

var app = express();
dotenv.config();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieSession({ name: 'session', secret: process.env.COOKIE_SESSION_SECRET, maxAge: 40 * 60 * 1000 /* 40min */ }));


app.use(authenticateRequest);
app.use('/', index);
app.use('/s', s);
app.use('/rooms', rooms);
app.use('/api', api);
app.use('/authenticate', authenticate);
app.use('/dashboard', dashboard);
app.use('/edit', edit);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
     var err = new Error('Not Found');
     err.status = 404;
     next(err)
});

// error handler
app.use(function(err, req, res, next) {
     // set locals, only providing error in development
     res.locals.message = err.message;
     res.locals.error = req.app.get('env') === 'development' ? err : {};

     // render the error page
     res.status(err.status || 500);
     res.render('error');
});


function authenticateRequest(req, res, next) {
    const possibleToken = req.session.token;
    // check header or cookies for token
    const token = possibleToken || req.headers['x-access-token'];
    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
            if (err) {
                req.isAuthenticated = false; // falsy or expired token
                next();
            } else {
                // if everything is good, save to request for use in other routes
                getUserInfo(decoded.user_id, function (user) {
                    req.isAuthenticated = true;
                    req.user = user;
                    next();
                });
            }
        });
    } else {
        req.isAuthenticated = false; // there is no token
        next();
    }
    console.log('isAuthenticated: ' + req.isAuthenticated);
}



function getUserInfo(id, callback) {
    const db = require('./database');
    db.query('SELECT * FROM users WHERE id = ?', [id], function (err, result) {
        if (err) throw err;
        callback(result[0]);
    });
}


module.exports = app;
