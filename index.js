
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3001;

app.use(express.static(__dirname + '/public'));

//heroku features:enable http-session-affinity
//to work with socket io

function onConnection(socket){
  socket.on('drawing', function(data){
    socket.broadcast.emit('drawing', data);
    console.log(data);
  });
}

io.on('connection', onConnection);

http.listen(port, () => console.log('listening on port ' + port));
