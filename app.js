var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var ejs = require('ejs');
var flash = require('connect-flash');
//var multer = require('multer');
var fs = require('fs');
var cookie = require('cookie');
var ueditor = require("ueditor");

var accessLog = fs.createWriteStream('access.log', {flags: 'a'});
var errorLog = fs.createWriteStream('error.log', {flags: 'a'});

var router = require('./routes/router');
var settings = require('./settings');

var app = express();

app.set('port',process.env.PORT || 80);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(flash());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use(function(err,req, res, next) {
  var meta = '[' + new Date() + ']' + req.url + '\n';
  errorLog.write(meta + err.stack + '\n');
  next();
});

var sessionStore = new MongoStore({
    db: settings.db,
    host: settings.host,
    port: settings.port,
    url: 'mongodb://' + settings.host + ':' + settings.port + '/' + settings.db
  });
app.use(session({
  resave: false, 
  secret: settings.cookieSecret,
  saveUninitialized: true,
  key: settings.db,
  cookie: {maxAge: 1000*60*60*24*30},
  store: sessionStore
}));

/*Ueditor*/
app.use('/javascripts/Ueditor/ue',ueditor(path.join(__dirname, 'public'), function(req, res, next) {
  // ueditor 客户发起上传图片请求
  if(req.query.action === 'uploadimage'){
    var foo = req.ueditor;
    var date = new Date();
    var imgname = req.ueditor.filename;
    console.log('ueditor'+imgname);

    var img_url = '/images/ueditor/';
    res.ue_up(img_url); //你只要输入要保存的地址 。保存操作交给ueditor来做
  }
  //  客户端发起图片列表请求
  else if (req.query.action === 'listimage'){
    var dir_url = '/images/ueditor/';
    res.ue_list(dir_url);  // 客户端会列出 dir_url 目录下的所有图片
  }
  // 客户端发起其它请求
  else {
    res.setHeader('Content-Type', 'application/json');
    res.redirect('/javascripts/ueditor/nodejs/config.json')
}}))

// app.use('/index',multer({
//   dest: './public/files/',
//   rename: function(fieldname,filename){
//     return fieldname;
//   }
// }));

router(app,accessLog,errorLog);

/*聊天室*/
var server = http.createServer(app);
var io = require('socket.io').listen(server);
//var SessionSockets = require('session.socket.io');

io.use(function(socket,next){
  var data = socket.handshake || socket.request;
  if (data.headers.cookie) {
    data.cookie = cookie.parse(data.headers.cookie);
    data.sessionID = cookieParser.signedCookie(data.cookie[settings.db],settings.cookieSecret);
    data.sessionStore = sessionStore;
    sessionStore.get(data.sessionID,function(err,session){
      if (err || !session) {
        return next(new Error('session not found'))
      } else {
        data.session = session;
        data.session.id = data.sessionID;
        next();
      }
    })
  } else {
    return next(new Error('Missing cookie headers'));
  }
})

io.on('connect',function(socket){
  socket.emit('open');
  console.log(socket.handshake);
  var session = socket.handshake.session;
  var userClient = {
    socket: socket,
    name: session.user.name,
    color: getcolor()
  }
  socket.on('message',function(msg){
    var msgObj = {
      time: getTime(),
      color: userClient.color
    }

    if (!userClient.name) {
      userClient.name = msg;
      msgObj['text'] = msg;
      msgObj['author'] = 'system';
      msgObj['type'] = 'welcome';

      console.log(userClient.name + 'login');
      accessLog.write('login: ' + userClient.name);
      socket.emit('system',msgObj);
      socket.broadcast.emit('system',msgObj);
    } else {
      msgObj['text'] = msg;
      msgObj['name'] = userClient.name;
      msgObj['type'] = 'message';
      msgObj['color'] = userClient.color;

      console.log(userClient.name + 'says' + msg);
      socket.emit('message',msgObj);
      socket.broadcast.emit('message',msgObj);
    }
  })

  socket.on('disconnect',function(){
    var msgObj = {
      time: getTime(),
      color: getcolor(),
      text: userClient.name,
      author: 'system',
      type: 'disconenct'
    }

    socket.broadcast.emit('system',msgObj);
    console.log(userClient.name + 'disconnect');
    accessLog.write('disconnect: ' + userClient.name);
  })
})

server.listen(app.get('port'),function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var getTime = function(){
  var date = new Date();
  
  return date.getHours()+":"+(date.getMinutes()> 9 ? date.getMinutes() : ("0" + date.getMinutes()))+":"+(date.getSeconds()>9?date.getSeconds():("0"+date.getSeconds()));
}

var getcolor = function(){
  var colors = ['aliceblue','antiquewhite','aqua','aquamarine','pink','red','green',
                'orange','blue','blueviolet','brown','burlywood','cadetblue'];
  return colors[Math.round(Math.random() * 100 % colors.length)];
}
