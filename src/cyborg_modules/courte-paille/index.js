
var express = require('express')
var app = express();
var server = require('http').Server(app);
var path = require("path");
var io = require('socket.io')(server);


module.exports.start = function (cyborgConfig,callback) {

  app.use('/static',express.static(path.join(__dirname, './client/static')));

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '/client'));


  app.get('/',function (req,res,next) {
      res.render('index');
  });

  server.listen(cyborgConfig.port,callback);


  io.on('connection',function (socketClient) {
    console.log("salut courte-paille");
  });

}

module.exports.stop = function (callback) {
  server.close(callback);
}
