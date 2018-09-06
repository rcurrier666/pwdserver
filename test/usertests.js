var expect  = require('chai').expect;
var request = require('request');

describe('User functions', () => {
  it('/ - failure', (done) => {
      request('http://localhost:3000/', function(error, response, body) {
          expect(response.statusCode).to.equal(404);
          done();
      });
  });

  it('/users - success', (done) => {
      request('http://localhost:3000/users', function(error, response, body) {
          expect(body).to.equal('[{"name":"root","uid":0,"gid":0,"comment":"root","home":"/root","shell":"/bin/bash"},{"name":"daemon","uid":1,"gid":1,"comment":"daemon","home":"/usr/sbin","shell":"/usr/sbin/nologin"},{"name":"rcurrier","uid":1001,"gid":1001,"comment":"Ron Currier,,,","home":"/home/rcurrier","shell":"/bin/bash"},{"name":"testuser","uid":1002,"gid":1002,"comment":"Test User","home":"/home/testuser","shell":"/bin/ksh"},{"name":"nobody","uid":65534,"gid":65534,"comment":"nobody","home":"/nonexistent","shell":"/usr/sbin/nologin"}]');
          expect(response.statusCode).to.equal(200);
          done();
      });
  });

  it('/users/:uid - success', (done) => {
      request('http://localhost:3000/users/1001', function(error, response, body) {
          expect(body).to.equal('[{"name":"rcurrier","uid":1001,"gid":1001,"comment":"Ron Currier,,,","home":"/home/rcurrier","shell":"/bin/bash"}]');
          expect(response.statusCode).to.equal(200);
          done();
      });
    });

  it('/users/:uid - failure', (done) => {
      request('http://localhost:3000/users/55', function(error, response, body) {
          expect(body).to.equal('404 - Not found');
          expect(response.statusCode).to.equal(404);
          done();
      });
    });

  it('/users/query?name=testuser - success', (done) => {
      request('http://localhost:3000/users/query?name=testuser', function(error, response, body) {
          expect(body).to.equal('[{"name":"testuser","uid":1002,"gid":1002,"comment":"Test User","home":"/home/testuser","shell":"/bin/ksh"}]');
          expect(response.statusCode).to.equal(200);
          done();
      });
    });

  it('/users/query?name=testuser&uid=1002 - success', (done) => {
      request('http://localhost:3000/users/query\?name=testuser&uid=1002', function(error, response, body) {
          expect(body).to.equal('[{"name":"testuser","uid":1002,"gid":1002,"comment":"Test User","home":"/home/testuser","shell":"/bin/ksh"}]');
          expect(response.statusCode).to.equal(200);
          done();
      });
    });

  it('/users/query?name=testuser&uid=99 - failure', (done) => {
      request('http://localhost:3000/users/query?name=testuser&uid=99', function(error, response, body) {
          expect(body).to.equal('404 - Not found');
          expect(response.statusCode).to.equal(404);
          done();
      });
    });

  it('/users/:uid/groups - success', (done) => {
      request('http://localhost:3000/users/1001/groups', function(error, response, body) {
          expect(body).to.equal('[{"name":"sudo","gid":27,"members":["osboxes","rcurrier"]},{"name":"operator","gid":37,"members":["rcurrier"]},{"name":"rcurrier","gid":1001,"members":["rcurrier"]}]');
          expect(response.statusCode).to.equal(200);
          done();
      });
    });

  it('/users/:uid/groups - failure', (done) => {
      request('http://localhost:3000/users/99/groups', function(error, response, body) {
          expect(body).to.equal('404 - User not found');
          expect(response.statusCode).to.equal(404);
          done();
      });
    });
});
