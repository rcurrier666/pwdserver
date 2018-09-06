/*jshint esversion: 6 */ 
/*jshint node: true */

var expect  = require ( 'chai' ).expect;
var request = require ( 'request' );

describe ( 'Group functions', ( ) => {

  it ( '/groups - success', ( done ) => {
      request ( 'http://localhost:3000/groups', ( error, response, body ) => {
          expect ( body ).to.equal ( '[{"name":"root","gid":0,"members":[]},{"name":"daemon","gid":1,"members":[]},{"name":"bin","gid":2,"members":[]},{"name":"sys","gid":3,"members":["syslog"]},{"name":"adm","gid":4,"members":["syslog","osboxes"]},{"name":"sudo","gid":27,"members":["osboxes","rcurrier"]},{"name":"operator","gid":37,"members":["rcurrier"]},{"name":"plugdev","gid":46,"members":["osboxes"]},{"name":"lpadmin","gid":115,"members":["osboxes"]},{"name":"rcurrier","gid":1001,"members":["rcurrier"]},{"name":"testuser","gid":1002,"members":["testuser"]}]' );
          expect ( response.statusCode ).to.equal ( 200 );
          done ( );
      });
  });

  it ( '/groups/:gid - success', ( done ) => {
      request ( 'http://localhost:3000/groups/1001', ( error, response, body ) => {
          expect ( body ).to.equal ( '[{"name":"rcurrier","gid":1001,"members":["rcurrier"]}]' );
          expect ( response.statusCode ).to.equal ( 200 );
          done ( );
      });
    });

  it ( '/groups/:gid - failure', ( done ) => {
      request ( 'http://localhost:3000/groups/55', ( error, response, body ) => {
          expect ( body ).to.equal ( '404 - Not found' );
          expect ( response.statusCode ).to.equal ( 404 );
          done ( );
      });
    });

  it ( '/groups/query?name=testuser - success', ( done ) => {
      request ( 'http://localhost:3000/groups/query?name=testuser', ( error, response, body ) => {
          expect ( body ).to.equal ( '[{"name":"testuser","gid":1002,"members":["testuser"]}]' );
          expect ( response.statusCode ).to.equal ( 200 );
          done ( );
      });
    });

  it ( '/groups/query?name=testuser&gid=1002 - success', ( done ) => {
      request ( 'http://localhost:3000/groups/query?name=testuser&gid=1002', ( error, response, body ) => {
          expect ( body ).to.equal ( '[{"name":"testuser","gid":1002,"members":["testuser"]}]' );
          expect ( response.statusCode ).to.equal ( 200 );
          done ( );
      });
    });

  it ( '/groups/query?name=testuser&gid=99 - failure', ( done ) => {
      request ( 'http://localhost:3000/groups/query?name=testuser&gid=99', ( error, response, body ) => {
          expect ( body ).to.equal ( '404 - Not found' );
          expect ( response.statusCode ).to.equal ( 404 );
          done ( );
      });
    });

});
