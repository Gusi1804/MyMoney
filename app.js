var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var newTransactionRouter = require('./routes/new-transaction');
var newAccountRouter = require('./routes/new-account');
var accountsRouter = require('./routes/accounts');
var deleteRouter = require('./routes/delete');
var newProjectRouter = require('./routes/new-project');
var projectsRouter = require('./routes/projects');
var newCategoryRouter = require('./routes/new-category');
var categoriesRouter = require('./routes/categories')
var loginRouter = require('./routes/login');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/new/transaction', newTransactionRouter);
app.use('/new/account', newAccountRouter);
app.use('/accounts', accountsRouter);
app.use('/delete', deleteRouter);
app.use('/new/project', newProjectRouter);
app.use('/projects', projectsRouter);
app.use('/new/category', newCategoryRouter);
app.use('/categories', categoriesRouter);
app.use('/login',loginRouter);

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
