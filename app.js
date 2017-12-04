
var db = require('./models/db');
var logger = require('./models/logger');

var express = require('express');
var http = require('http');
var path = require('path');
var io = require('socket.io');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ 'limit':'10000kb' }));
app.use(bodyParser.urlencoded({ extended:false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

app.use(session({
     secret: '12345',
     name: 'testapp',
     cookie: {maxAge:1000*60*60*24*30},
     resave: false,
     saveUninitialized: true,
     store: new MongoStore({   //创建新的mongodb数据库
         mongooseConnection:db
     })
}));

var router = require('./routes/index');
var UserRouter = require('./routes/user');


db.on('error',console.error.bind(console,'链接错误:'));
db.once('open',function(){
  console.log('链接成功！');
});

app.use('/', UserRouter);
app.use('/', router);

var server = http.createServer(app);
server.listen(8080,'127.0.0.1');

var socket = io.listen(server);

socket.on('connection', function(client){ 
	console.log('创建socket链接成功');

	 client.on('disconnect',function(){ 
		console.log('关闭socket链接')
  	});

	 client.on('updataCGD',function(obj){
  		console.log('socket'+obj.Time);
  		socket.emit('plusCreate',{"msg":'新增了'+obj.Time+'采购单'});
 	 });

	 client.on('createCGD',function(obj){
  		console.log('socket'+obj.Time);
  		socket.emit('plusUpdata',{"msg":'更新了'+obj.Time+'采购单'});
 	 });

})
