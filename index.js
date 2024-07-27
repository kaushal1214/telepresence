'use strict';
var fs = require('fs');
const path = require('path');
var express = require('express');
var app = express();
var os = require('os');
var nodeStatic = require('node-static');
var http = require('http');
var socketIO = require('socket.io');
const PORT = process.env.PORT || 3300
var Room;


app.use('/public', express.static(path.join(__dirname,'public')));

app.set('view engine','hbs');

var server = http.createServer(app);

app.get('/',(req,res)=>{
	res.render('home.hbs');
});

app.use((req,res,next)=>{
	console.log(`${req.method}: ${req.url}`);
	next();
});
var io = socketIO.listen(server);

io.sockets.on('connection', function(socket) {

  // convenience function to log server messages on the client
  function log() {
    var array = ['Message from server:'];
    array.push.apply(array, arguments);
    socket.emit('log', array);
  }

socket.on('connection', function(data){
	socket.broadcast.emit('control',data);

	if(data.status === 'disconnected')
		socket.leave(Room);
});

//Robot Controlling Events
 socket.on('keyUp', function(keyDetails){
	 console.log(keyDetails);
	var data = {keyDetails: keyDetails.key, keyEvent: 'keyUp'};
	socket.broadcast.emit('control',data);
 });

 socket.on('keyPress', function(keyDetails){
	 console.log(keyDetails);
	var data = {keyDetails: keyDetails.key, keyEvent: 'keyPress'};
	socket.broadcast.emit('control',data);
 });

  socket.on('message', function(message) {
    log('Client said: ', message);
    socket.broadcast.emit('message', message);
	  var data ={message};
  });

  socket.on('create or join', function(room) {
    log('Received request to create or join room ' + room);
    var clientsInRoom = io.sockets.adapter.rooms[room];
    var numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;
	Room = room;
    log('Room ' + room + ' now has ' + numClients + ' client(s)');

    if (numClients === 0) {
      socket.join(room);
      log('Client ID ' + socket.id + ' created room ' + room);
      socket.emit('created', room, socket.id);

    } else if (numClients === 1) {
      log('Client ID ' + socket.id + ' joined room ' + room);
      io.sockets.in(room).emit('join', room);
      socket.join(room);
      socket.emit('joined', room, socket.id);
      io.sockets.in(room).emit('ready');
    } else { // max two clients
      socket.emit('full', room);
    }
  });

  socket.on('ipaddr', function() {
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
      ifaces[dev].forEach(function(details) {
        if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
          socket.emit('ipaddr', details.address);
        }
      });
    }
  });

});

server.listen(PORT, ()=>{
	console.log(`Server started at ${PORT}`);
});
