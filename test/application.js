'use strict';

var tcp = require('../');

describe('application', function() {
  var server;
  it('should be able to spin up tcp server', function(done) {
    var app = new tcp();

    server = app.listen(1337, function() {
      done();
    });

    server.on('error', done);
  });

  after(function(done) {
    if (server) server.close(done);
  });
});
