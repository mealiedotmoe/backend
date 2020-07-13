var createError = require('http-errors');
var express = require('express');
var cors = require('cors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var helmet = require('helmet');

var authCheckMiddleware = require('./middleware/auth-check');

var botRouter = require('./routes/bot');

var indexRouter = require('./routes/index');
var loginRouter = require('./routes/login');
var userRouter = require('./routes/user');
var pollRouter = require('./routes/polls');

var infoRouter = require('./routes/info');
var faqRouter = require('./routes/faq');
var musicRouter = require('./routes/music');
var eventsRouter = require('./routes/events');
var gamesRouter = require('./routes/games');
var paletteRouter = require('./routes/palette');

var archiveRouter = require('./routes/archives');

var app = express();
app.use(cors());
app.options('*', cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(helmet());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', authCheckMiddleware);
app.use('/users', userRouter);
app.use('/polls', pollRouter);
app.use('/discord/login', loginRouter);
app.use('/info', infoRouter);
app.use('/faq', faqRouter);
app.use('/music', musicRouter);
app.use('/events', eventsRouter);
app.use('/games', gamesRouter);
app.use('/bot', authCheckMiddleware);
app.use('/bot', botRouter);
app.use('/palette', paletteRouter);
app.use('/archive', archiveRouter);

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

if (!module.parent) {
    app.listen(3000);
}

module.exports = app;

