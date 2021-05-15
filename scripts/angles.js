#!/usr/bin/env node

var sensibility = 15
var rose = ['ne', 'nw', 'sw', 'se']

;[45, 135, 225, 315].forEach((a, i) => {
  console.log(`const ${rose[i]}=[${a - sensibility}, ${a + sensibility}];`)
})
