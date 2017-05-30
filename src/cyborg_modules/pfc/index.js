// Param
var port = 3001;
var nbJoueursMax = 2;
var idJoueur = 0;

const path = require('path')
const express = require('express')
const app = express()
const events = require('events');
const connect = require('connect');
const pfc = require('./lib/pfc.js');
const bodyParser = require('body-parser');
const session = require('express-session');


var eventEmitter = new events.EventEmitter();

var mySession;

app.use(session({secret: 'secret2'}));

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(bodyParser.urlencoded({ extended: false }))

app.use('/static', express.static(path.join(__dirname, 'static')))

app.get('/', function (req, res) {
  mySession = req.session;

  if(mySession.idJoueur){
      var id = mySession.idJoueur;
      res.render('menu', { idJoueur: id });
  }else {
    if(idJoueur >= nbJoueursMax){
      res.send('deso')
    }else{
      mySession.idJoueur = ++idJoueur;
      var id = mySession.idJoueur;
      res.render('menu', { idJoueur: id });
    }
  }
})

function hasIdJoueur(req,res,next) {
  if(req.session){
    next();
  }else {
    res.send("DESO, je t'ai dis !!!");
  }
}

app.post('/choix',hasIdJoueur, function (req, res) {
  var idJoueur = req.body.idJoueur;
  var choix = req.body.choix;
  if(!pfc.isOk()){
      pfc.set(idJoueur,choix);
  }
  res.render('result');
})

app.get('/result',hasIdJoueur, function (req, res) {

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
   }

})

app.get('/resultFin', function (req, res) {
  res.send("Le gagnant est "+ pfc.result() );
  process.send({ state: "KILLME"});
})

app.listen(port, function () {
  console.log('Example app listening on port 3000!')
  process.send({ state: "OK"});
})
