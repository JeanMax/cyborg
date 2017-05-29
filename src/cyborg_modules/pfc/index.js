// Param
var port = 3000;
var nbJoueursMax = 2;
var idJoueur = 0;

const path = require('path')
const express = require('express')
const app = express()
const events = require('events');
const connect = require('connect');
const pfc = require('./lib/pfc.js');
const bodyParser = require('body-parser');

var eventEmitter = new events.EventEmitter();

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(bodyParser.urlencoded({ extended: false }))

app.use('/static', express.static(path.join(__dirname, 'static')))

app.get('/', function (req, res) {
  idJoueur += 1;
  res.render('menu', { idJoueur: idJoueur });
})

app.post('/choix', function (req, res) {
  var idJoueur = req.body.idJoueur;
  var choix = req.body.choix;
  pfc.set(idJoueur,choix);
  res.render('result');
})

app.get('/result', function (req, res) {


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

app.listen(port, function () {
  console.log('Example app listening on port 3000!')
})
