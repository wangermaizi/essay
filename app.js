var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var uploadRouter = require("./routes/upload");
var apiRouter = require('./routes/api');
const cors = require('cors');

var app = express();

// 允许跨域
// app.use(cors);  这里设置不对的话, 会严重影响项目运行的

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(Mock);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// 设置静态资源目录
app.use(express.static(path.join(__dirname, 'public')));

// 设置路由中间件
app.use('/', indexRouter);
app.use('/users', usersRouter);

// 监听上传路径
app.use('/upload',uploadRouter);

function allowOrigin (req, res, next){
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Content-Type', 'application/json;charset=utf-8');
  next()
}

// 监听上传路径
app.use('/api', allowOrigin, apiRouter);

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
