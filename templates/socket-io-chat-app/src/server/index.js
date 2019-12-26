var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var CWD = process.cwd();
let globalState = {
  usersById: {},
  loggedInById: {},
};

app.get('/', function(req, res){
  res.sendFile(CWD + '/src/public/index.html');
});

http.listen(3000, function(){
  console.log('listening on 0.0.0.0:3000');
});

io.on('connection', function(socket){
  socket.emit('connected');

  socket.on('disconnect', function (msg) {
    io.emit('user disconnected', msg);
  });

  socket.on('message-all', (msg) => {
    console.log(msg);
    io.emit('message-all', msg);
  });

  socket.on('login', function (msg) {
    if (!globalState.usersById[msg.userName]) {
      globalState = {
        ...globalState,
        usersById: {
          ...globalState.usersById,
          [msg.userName]: {
            userName: msg.userName,
            password: msg.password,
          },
        },
        loggedInById: {
          ...globalState.loggedInById,
          [msg.userName]: true,
        },
      };
    }
    io.emit('data', `logged in: ${msg.userName}`);
  });
});