require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var associationsRouter = require('./routes/associations');
var chatsRouter = require('./routes/chat');
var roomsRouter = require('./routes/room');
var ajoutFictifMembresRouter = require('./routes/ajoutFictifMembres');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/associations', associationsRouter);
app.use('/chat', chatsRouter);
app.use('/rooms', roomsRouter);
app.use('/fake', ajoutFictifMembresRouter);

module.exports = app;
