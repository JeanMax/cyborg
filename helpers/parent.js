const fork = require('child_process').fork;

var fils = fork(`${__dirname}/child.js`);


fils.on('message', (m) => {
  console.log('PARENT got message:', m);
});

fils.send({ hello: 'world' });
