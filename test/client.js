'use strict';

var tcp = require('../');
var net = require('net');
var assert = require('assert');
var sinon = require('sinon');

describe('client', function() {
  var app, server, port = 8888;

  beforeEach(function() {
    app = new tcp();
  });

  afterEach(function(done) {
    if (server) server.close(done);
  });

  it('should be able to return data', function(done) {
    var fixture = 'test';

    app.use(function *() {
      this.body = fixture;
    });

    server = app.listen(port);

    server.on('error', done);

    var client = new net.Socket();
    client.connect(port, function() {
      client.write('client');
    });

    client.on('data', function(data) {
      assert(data);
      var result = JSON.parse(data.toString());
      assert(result === fixture, 'data return is incorrect');
      client.destroy();
      done();
    });

    client.on('error', done);
  });

  it('should be able to return object data', function(done) {
    var fixture = {
      key: 'value'
    };

    app.use(function *() {
      this.body = fixture;
    });

    server = app.listen(port);

    server.on('error', done);

    var client = new net.Socket();
    client.connect(port, function() {
      client.write('client-2');
    });

    client.on('data', function(data) {
      assert(data);
      var result = JSON.parse(data.toString());
      assert(~Object.getOwnPropertyNames(result).indexOf('key'), 'does not contain proper key');
      assert(result.key === fixture.key, 'value return is incorrect');
      client.destroy();
      done();
    });

    client.on('error', done);
  });

  it('should be able to catch error', function(done) {
    var error = new Error('error');

    app.use(function *() {
      throw error;
    });

    server = app.listen(port);

    server.on('error', done);

    var client = new net.Socket();
    client.connect(port, function() {
      client.write('data');
    });

    client.on('data', function(data) {
      assert(data);
      data = JSON.parse(data.toString());
      assert(data.error);
      done();
    });

    client.on('error', done);
  });

  describe('multiple middlewares', function() {
    it('should be able to use multiple middlewares', function(done) {
      var fixture = 'value';
      var spy = sinon.spy();

      app.use(function *(next) {
        yield next;
        spy();
      });

      app.use(function *() {
        this.body = fixture;
      });

      server = app.listen(port);
      server.on('error', done);

      var client = new net.Socket();
      client.connect(port, function() {
        client.write('client-2');
      });

      client.on('data', function(data) {
        assert(spy.calledOnce);
        done();
      });

      client.on('error', done);
    });

    it('should not called middlewares after error', function(done) {
      var fixture = 'value';
      var spy = sinon.spy();

      app.use(function *(next) {
        yield next;
        spy();
      });

      app.use(function *() {
        throw new Error();
      });

      server = app.listen(port);
      server.on('error', done);

      var client = new net.Socket();
      client.connect(port, function() {
        client.write('client-2');
      });

      client.on('data', function(data) {
        assert(spy.notCalled);
        done();
      });

      client.on('error', done);
    });

    it('should be able to pass states around', function(done) {
      var fixture = 'value';

      app.use(function *(next) {
        this.state.test = fixture;
        yield next;
      });

      app.use(function *() {
        this.body = this.state.test;
      });

      server = app.listen(port);
      server.on('error', done);

      var client = new net.Socket();
      client.connect(port, function() {
        client.write('client-3');
      });

      client.on('data', function(result) {
        result = result.toString();
        result = JSON.parse(result);
        assert(result === fixture, 'state was lost');
        done();
      });

      client.on('error', done);
    });
  });
});
