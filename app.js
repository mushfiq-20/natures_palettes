// DECLARATION
var express = require('express');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var fileUpload = require('express-fileupload');

var app = express();

var index = require('./controllers/index');
// var login = require('./controllers/login');
// var register = require('./controllers/register');
// var userhome = require('./controllers/users/home');
// var adminhome = require('./controllers/admin/home');
// var logout = require('./controllers/logout');

// CONFIGURATION
app.set('view engine', 'ejs');


// MIDDLEWARES
app.use(bodyParser.urlencoded({extended:false}));
app.use(expressSession({secret: 'my top secret password', saveUninitialized: true, resave: false}));
app.use(express.static('public'));
app.use(require('connect-flash')());

app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});
app.use(function(req, res, next) {
  //res.locals.cart = req.session.cart;
  res.locals.loggedUser = req.session.loggedUser;
  res.locals.lastLog = req.session.lastLog;
  res.locals.msg = req.session.msg;
  next();
});

app.use(fileUpload());


app.use('/', index);
// app.use('/login', login);
// app.use('/register', register);
// app.use('/users/home', userhome);
// app.use('/admin/home', adminhome);
// app.use('/logout', logout);

// SERVER
app.listen(1338, function(){
	console.log('server started on 127.0.0.1:1338...');
});