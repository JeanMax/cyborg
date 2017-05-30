// const ip = require("ip").address();
// var initPort = 3000;
// var child = require('child_process').fork('./cyborg_modules/pfc/index.js');


var express = require('express')
var router = express.Router()

router.all('*',function (req,res,next) {
    res.send('TODO');
});

module.exports = router
