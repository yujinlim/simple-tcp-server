'use strict';

var net = require('net');
var co = require('co');
var compose = require('koa-compose');
var assert = require('assert');
var serializerr = require('serializerr');
var debug = require('debug')('koa-tcp');

var response = require('./lib/response');
var request  = require('./lib/request');

module.exports = App;

function App() {
  this.middlewares = [];
}

App.prototype.use = function(fn) {
  assert(fn && fn.constructor.name === 'GeneratorFunction', 'app.use() requires a generator function');
  this.middlewares.push(fn);
  return this;
};

App.prototype.listen = function() {
  var server = net.createServer(this.handler.bind(this));
  server.listen.apply(server, arguments);
  return server;
};

App.prototype.response = function() {
  var cn = compose(this.middlewares);
  var fn = co.wrap(cn);
  var self = this;

  return function(client, data) {
    data = data.toString();
    var context = self._createContext(client, data);
    fn.call(context)
      .then(self._respond.bind(self, client, context))
      .catch(function (err) {
        err = serializerr(err);
        context.body = {
          error: err
        };
        self._respond(client, context);
      });
  };
};

App.prototype.handler = function(client) {
  client.on('data', (this.response()).bind(this, client));
};

App.prototype._createContext = function(client, data) {
  var req = Object.create(request);
  req.req = {
    socket: client,
    data: data
  };
  var context = Object.create(response);
  context.req = req;
  context.state = {};
  return context;
};

App.prototype._respond = function(client, context) {
  var body = context.body;
  var result = {};
  if (!body) return client.end();

  result = JSON.stringify(body);
  client.end(result, 'utf-8');
};
