var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

/* SWAGGER*/
var argv = require('minimist')(process.argv.slice(2));
var swagger = require("swagger-node-express");

/* ROUTES */
var users = require('./routes/users');
var notifications = require('./routes/notifications');
var groups = require('./routes/groups');
var events = require('./routes/events');
var votes = require('./routes/votes');
var chats = require('./routes/chats');
var euros = require('./routes/euros');

/* APP */
var app = express();

/* CORS */
var cors = require('cors');
app.use(cors());


/* VIEWS */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

/* SWAGGER DOC */
var subpath = express();

app.use("/v1", subpath);

swagger.setAppHandler(subpath);

/* INFO API */
swagger.setApiInfo({
    title: "example API",
    description: "API to do something, manage something...",
    termsOfServiceUrl: "",
    contact: "yourname@something.com",
    license: "",
    licenseUrl: ""
});

/* SWAGGER UI*/
subpath.get('/', function (req, res) {
    res.sendFile(__dirname + '/dist/index.html');
});

/* SWAGGER CONFIG */
swagger.configureSwaggerPaths('', 'api-docs', '');

var applicationUrl = 'https://platine-groupin.herokuapp.com/';
swagger.configure(applicationUrl, '1.0.0');


// uncomment after placing your favicon in /public
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('dist'));

/* APIS */
app.use('/users', users);
app.use('/notifications', notifications);
app.use('/groups', groups);
app.use('/events', events);
app.use('/votes', votes);
app.use('/chats', chats);
app.use('/euros', euros);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
