const path = require('path')
const express = require('express')
const app = express()
const events = require('events');
const connect = require('connect');
const pfc = require('./lib/pfc.js');
const bodyParser = require('body-parser');
const session = require('express-session');
var argv = require('minimist')(process.argv.slice(2));

const cyborgConfig = require('../../cyborg-config.json');


var port = argv.p;
var listPlayer = argv._;
pfc.setIds(listPlayer);

var eventEmitter = new events.EventEmitter();

var secret = cyborgConfig.secret_session;

var sessionMiddleware = session({
    secret: secret
});

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(bodyParser.urlencoded({ extended: false }))

app.use('/static', express.static(path.join(__dirname, 'static')))

app.use(sessionMiddleware);
// app.use(function (req, res, next) {
//   var suid = req.query.suid;
//
//   // Si le suid du joueur est dans la liste des joueurs
//   if(listPlayer.indexOf(suid) != -1){
//     next();
//   }else{
//     res.send('deso')
//   }
// })

app.get('/', function (req, res,next) {
  req.session.suid = Number(req.query.suid);
  next();
});

function idmiddleware (req, res, next) {
  var suid = req.session.suid;

  // Si le suid du joueur est dans la liste des joueurs
  if(listPlayer.indexOf(suid) != -1){
    next();
  }else{
    res.send('deso')
  }
}

app.get('/',idmiddleware ,function (req, res) {
  var suid = req.session.suid;
  res.render('menu', { idJoueur: suid });
});


app.post('/choix',idmiddleware, function (req, res) {
  var suid = req.session.suid;
  var choix = req.body.choix;
  if(!pfc.isOk()){
      pfc.setChoix(suid,choix);
  }
  res.render('result');
})

app.get('/result', idmiddleware, function (req, res) {

  res.writeHead(200, {
     'Connection': 'keep-alive',
     'Content-Type': 'text/event-stream',
     'Cache-Control': 'no-cache'
   });

   eventEmitter.on('result', function () {
       var testdata = pfc.result();
       res.write('data: ' + JSON.stringify({ msg : testdata }) + '\n\n');
   });

   if(pfc.isOk()){
     eventEmitter.emit('result');
     var winner = pfc.result();
     process.send({ state: "FINISH", winner : winner});
   }
})


app.listen(port, function () {
  console.log('Example app listening on port '+port)
  if(process.send){
      process.send({ state: "READY"});
  }

})
