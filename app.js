const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config();

const indexRouter = require('./routes/index');
const estimatorRouter = require('./routes/estimator');
const cartRouter = require('./routes/cart');
const usersRouter = require('./routes/users');

const app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// session configuration
app.use(session({
  secret: process.env.SESSIONS_SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  // cookie: { secure: true },
}));
app.use((req, res, next) => {
  if (!req.session.userId) {
    req.session.userId = uuidv4();
    // console.log(req.session.userId);
  }
  
  next();
});

app.use('/', indexRouter);
app.use('/estimator', estimatorRouter);
app.use('/cart', cartRouter);
app.use('/users', usersRouter);

app.use('/modules', express.static(path.join(__dirname, 'node_modules')));


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
