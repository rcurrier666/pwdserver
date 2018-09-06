///////////////////////////////////////////////////////////////////////
//
// index.js
//
// Entry point for pwdserver
//
// Date: 6 Sep 2018
// Author: Ron Currier
// Copyright 2018 by Sparkfish Heavy Industries
// License: MIT
// 
///////////////////////////////////////////////////////////////////////

/*jshint esversion: 6 */ 
/*jshint node: true */

const express = require ( 'express' );
const app = express();
const passwd = require ( './loadpasswd.js' );
const group = require ( './loadgroup.js' );

//
// Configure options
//
argv = require ( 'yargs' )
.usage ( '$0 [options]' )
  .options ( {
    'd': {
      alias: 'debug',
      default: false,
      describe: 'Output excessive internal details to console',
      type: 'boolean'
    },
    'g': {
      alias: 'groupfile',
      default: '/etc/group',
      describe: 'File path to group file',
      nargs: 1,
      normalize: true,
      requiresArg: true,
      type: 'string'
    },
    'n': {
      alias: 'nowarn',
      default: false,
      describe: 'Suppress the /etc/passwd and /etc/group usage warning',
      type: 'boolean'
    },
    'o': {
      alias: 'outputtype',
      describe: 'Format to use for output',
      default: 'text',
      nargs: 1,
      requiresArg: true,
      type: 'string',
      choices: ['json', 'text'],
    },
    'p': {
      alias: 'passwdfile',
      // default: 'testfiles/passwd',
      default: '/etc/passwd',
      describe: 'File path to passwd file',
      nargs: 1,
      normalize: true,
      requiresArg: true,
      type: 'string'
    },
    'port': {
      default: 3000,
      describe: 'Port to listen on',
      type: 'number'
    }
  } )
  .argv;

global.debug = argv.debug;
global.jsonOutput = ( argv.outputtype=="json" );

if ( !argv.nowarn && ( argv.passwdfile == '/etc/passwd' || argv.groupfile == '/etc/group' ) )
{
  console.warn (
    '  +=======================================================+\n' +
    '  |                     WARNING                           |\n' +
    '  | You are using the system passwd and group files.      |\n' +
    '  | Use with care as this potentially exposes system      |\n' +
    '  | level information to less than reputable individuals. |\n' +
    '  | This warning can be suppressed by using the --nowarn  |\n' +
    '  | flag when starting.                                   |\n' +
    '  +=======================================================+\n'
    );
}

//
// Initialize the caches
//
if ( !passwd.loadData ( argv.passwdfile ) || !group.loadData ( argv.groupfile ) )
{
  process.exit ( 1 );
}

//
// Routers
//
app.get ( '/users', usersHandler );
app.get ( '/users/query', usersHandler );
app.get ( '/users/:uid', usersHandler );
app.get ( '/users/:uid/groups', usersGroupsHandler );
app.get ( '/groups', groupsHandler );
app.get ( '/groups/query', groupsHandler );
app.get ( '/groups/:gid', groupsHandler );

app.listen ( argv.port, ( ) => {
  console.log ( `Listening on port ${argv.port}` );
} );

//
// Route handlers
//
function usersHandler ( req, res, next )
{
  if ( !req.route.path.includes ( "query" ) )
  {
    req.query = { };
  }

  if ( !isNaN ( req.params.uid ) )
  {
    // uid was provided, overwrite query parameters
    //  and search just for uid
    req.query = { uid: req.params.uid };
  }

  result = passwd.getUsers ( req.query );
  if ( result.length == 0 )
  {
    res.status ( 404 ).send ( '404 - Not found' );
  }
  else
  {
    if ( global.jsonOutput )
      res.send ( result );
    else
      res.send ( "<pre>" + JSON.stringify(result, null, 2 ) + "</pre>" );
  }
}

function usersGroupsHandler ( req, res, next )
{
  user = passwd.getUserByUID ( req.params.uid );
  if ( !user )
  {
    res.status ( 404 ).send ( '404 - User not found' );
  }
  else
  {
    query = { member: user.name };
    result = group.getGroups ( query );

    if ( global.jsonOutput )
      res.send ( result );
    else
      res.send ( "<pre>" + JSON.stringify ( result, null, 2 ) + "</pre>" );
  }
}

function groupsHandler ( req, res, next )
{
  if ( !req.route.path.includes ( "query" ) )
  {
    req.query = { };
  }

  if ( !isNaN ( req.params.gid ) )
  {
    // gid was provided, overwrite query parameters
    //  and search just for gid
    req.query = { gid: req.params.gid };
  }

  result = group.getGroups ( req.query );
  if ( result.length == 0 )
  {
    res.status ( 404 ).send ( '404 - Not found' );
  }
  else
  {
    if ( global.jsonOutput )
      res.send ( result );
    else
      res.send ( "<pre>" + JSON.stringify(result, null, 2 ) + "</pre>" );
  }
 
}
