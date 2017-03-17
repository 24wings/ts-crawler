import express = require('express');
import path = require('path');
import favicon = require('serve-favicon');
import logger = require('morgan');
import cookieParser = require('cookie-parser');
import bodyParser = require('body-parser');
import session = require('express-session');
import socket = require('socket.io');



var index = require('./routes/index');


var app = express();
var server = require('http').Server(app);
var io = socket(server);
app.use((req, res, next) => {
    res['io'] = io;
    next();
});
// 按照上面的解释，设置 session 的可选参数
app.use(session({
    secret: 'recommand 128 bytes random string', // 建议使用 128 个字符的随机字符串
    cookie: { maxAge: 60 * 1000 }
}));
// view engine setup
app.set('views', path.resolve(__dirname, '../views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.resolve(__dirname, '../public')));

/**
 * 没有缓存
 */

app.use((req, res, next) => {
    res.header('Cache-Control', 'no-cache');
    next();
});

/**
 * 记录session状态
 */
app.use(function (req, res, next) {
    res.locals.user = req.session.user || null;
    res.locals.path = req.path;
    next();
});

app.use('/', index);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err['status'] = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});



export { app, server };
