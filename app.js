var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login');
var categoryListRouter = require('./routes/categoryList');
var boardRouter = require('./routes/board');

var jqueryRouter = require('./js/jquery-3.6.0.min.js');
//var blockRouter = require('./js/jquery.blockUI.js');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//session
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        maxage: 1000 * 60 * 30
    }
})); 

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/login', loginRouter);
app.use('/categoryList', categoryListRouter);
app.use('/board', boardRouter);

app.use('/pic', express.static(__dirname + "/pic/"));
app.use('/js', express.static(__dirname + "/js/"));
app.use('/css', express.static(__dirname + "/css/"));
app.use('/data_template', express.static(__dirname + "/data_template/"));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
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

module.exports = app;
