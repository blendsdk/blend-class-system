// make BlendJS available
require('blend-class-system');

// require our main class
// Not needed since 2.1.0
// require(__dirname + '/Hello/app/Main.js');

// create the main object
var app = Blend.create('Hello.app.Main');

// run this baby
app.run();
