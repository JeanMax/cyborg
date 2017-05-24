var http = require('http');
var fs = require('fs');


// Chargement du fichier index.html affiché au client
var server = http.createServer(function(req, res) {
    if(req.url.includes("test")){
      fs.readFile('./jeu.html', 'utf-8', function(error, content) {
          res.writeHead(200, {"Content-Type": "text/html"});
          res.end(content);
      });
    }else if (req.url.includes("socket")) {
      if(req.url.includes("socket")){
        fs.readFile('./socket.io.js', 'utf-8', function(error, content) {
            res.writeHead(200, {"Content-Type": "application/javascript"});
            res.end(content);
        });
      }
    }

});

// Chargement de socket.io
var io = require('socket.io').listen(server);

// Quand un client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {
    console.log('Serveur 3001 :Un client est connecté !');
});


server.listen(3001);
