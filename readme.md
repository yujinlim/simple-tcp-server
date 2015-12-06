# Simple TCP [![Build Status](https://travis-ci.org/yujinlim/simple-tcp-server.svg)](https://travis-ci.org/yujinlim/simple-tcp-server)
A simple TCP server using koa styles and syntax with ES6 generators.

## Installation
```
npm i --save simple-tcp-server
```

## Example
```js
var TCP = require('simple-tcp-server');
var app = new TCP();

app.use(function *(next) {
  this.state.user = yield db.getUser();
  yield next;
});

app.use(function *() {
  this.body = this.state.user;
});

var server = app.listen(1337);

server.on('error', function(err) {
  console.error(err);
});
```
