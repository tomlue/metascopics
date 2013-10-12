
/**
 * Module dependencies.
 */
 var express = require('express'),
 fs = require('fs'),
 connect = require('connect'),
 http = require('http'),
 path = require('path'),
 mongoose = require('mongoose'),
 passport = require("passport"),
 flash = require("connect-flash");

 var env = process.env.NODE_ENV || 'development',
 config = require('./config/config')[env];

 mongoose.connect(config.db)

 //setting up mongo models
 var models_dir = __dirname + '/models';
 fs.readdirSync(models_dir).forEach(function (file) {
 	if(file[0] === '.') return; 
 	require(models_dir+'/'+ file);
 });
 require('./config/passport')(passport, config)

 var app = express();
 var server = http.createServer(app) 
 
// all environments
app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(require('stylus').middleware({ src: __dirname + '/public' }));
	app.use(express.session({ secret: 'kjhldfadfhjklladjkshfjhuhiuvbirub' }))
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

require('./config/routes')(app,passport);

app.listen(app.get('port'))
console.log("listening on",app.get('port'))

