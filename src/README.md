
# Architecture de cyborg
<pre><code>
.
├── client 
│   ├── cyborg.html
│   ├── README
│   └── static
│       ├── css
│       │   ├── cyborg.css
│       │   └── normalize.css
│       ├── img
│       │   ├── cyborg-face.svg
│       │   ├── expand.svg
│       │   ├── gears.svg
│       │   ├── speaker.svg
│       │   └── tabletop-players.svg
│       └── js
│           ├── jquery-3.2.1.js
│           ├── socket.io.js -> ../../../node_modules/socket.io-client/dist/socket.io.js
│           └── socket.io.js.map -> ../../../node_modules/socket.io-client/dist/socket.io.js.map
├── cyborg-config.json
├── cyborg_modules
│   ├── courte-paille
│   ├── README.md
│   └── welcome
│       ├── client
│       │   ├── chooseGame.ejs
│       │   ├── static
│       │   │   ├── css
│       │   │   │   └── welcome.css
│       │   │   └── img
│       │   │       └── ok.png
│       │   ├── waitforplayer.ejs
│       │   └── welcome.ejs
│       └── index.js
├── index.js
├── package.json
└── README.md
</code></pre>
