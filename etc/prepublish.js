var fs = require('fs');
var path = require('path');
var root = __dirname;
var file = fs.readFileSync(root + path.sep + 'README.npm').toString();
fs.writeFileSync(root + path.sep + '..' + path.sep + 'README.md');