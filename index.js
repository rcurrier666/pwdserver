/*jshint esversion: 6 */ 
/*jshint node: true */

const express = require( 'express' );
const app = express();
const passwd = require( './loadpasswd.js' );
//const groups = require( './loadgroups.js' );

global.debug = true;

// Initialize the caches
passwd.loadData( 'testfiles/passwd' );
//groups.loadData( 'testfiles/groups' );

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/users', (req, res) => {
  res.send ( passwd.getUsers(req.query) );
});

app.get('/user', (req, res) => {
  console.log( '>>>>> res :', res );
  // res.send ( passwd.getUsers );
});

app.listen(3000, () => {
  console.log('App listening on port 3000!')
});
