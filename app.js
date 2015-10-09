var express = require('express');
var path = require('path');
var fs = require('fs');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = require('hbs');
var Tabletop = require('tabletop');
var pkg = require('./package.json')
var Sheet = require('./models/sheet')
var config = require('./config/config')

var routes = require('./routes/index');

var app = express();

// view engine setup
hbs.localsAsTemplateData(app);
app.locals.pkg = pkg
app.locals.config = config.public
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials')
var blocks = {};
hbs.registerHelper('extend', function(name, context) {
  var block = blocks[name];
  if (!block) {
    block = blocks[name] = [];
  }
  block.push(context.fn(this));
});

hbs.registerHelper('block', function(name) {
  var val = (blocks[name] || []).join('\n');
  blocks[name] = [];
  return val;
});


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var key = '1AS60Zm5ytMoOI3AhvR0dcOF-G_3j2lpZR7VRBAzfBgE'

app.init = function(next) {
  fs.readFile('./config/sheet.json', 'utf8', function(err, data) {
    app.locals.sites = new Sheet(JSON.parse(data))
    app.locals.foo = 'bar'
    next()
  })
  // var sheet = Tabletop.init({
  //   key: key,
  //   callback: function(data, tabletop) {
  //     fs.writeFileSync('./config/sheet.json', JSON.stringify(data))
  //     app.locals.sheet = data
  //     next()
  //   },
  //   simpleSheet: true
  // })
}

module.exports = app;
