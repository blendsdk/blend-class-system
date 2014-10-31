var assert = require('assert');
require(__dirname + "/../lib/Blend.js");

assert.ok(Blend, 'Blend sanity');
assert.ok(Blend.defineClass, 'class builder sanity');

