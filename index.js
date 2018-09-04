/*jshint esversion: 6 */ 
/*jshint node: true */

const express = require( 'express' );
const app = express();
const passwd = require( './loadpasswd.js' );
//const groups = require( './loadgroups.js' );

//
// Configure options
//
argv = require('yargs')
.usage('$0 [options]')
  .options({
    'd': {
      alias: 'debug',
      default: false,
      describe: 'output excessive internal details to console',
      type: 'boolean'
    },
    'g': {
      alias: 'groupsfile',
      default: '/etc/groups',
      describe: 'file path to groups file',
      nargs: 1,
      normalize: true,
      requiresArg: true,
      type: 'string'
    },
    'o': {
      alias: 'outputtype',
      default: 'text',
      choices: ['json', 'text'],
      nargs: 1,
      requiresArg: true,
      type: 'string'
    },
    'p': {
      alias: 'passwdfile',
      default: '/etc/passwd',
      describe: 'file path to passwd file',
      nargs: 1,
      normalize: true,
      requiresArg: true,
      type: 'string'
    },
    'port': {
      default: 3000,
      describe: 'port to listen on',
      type: 'number'
    }
  })
  .argv;

global.debug = argv.debug;
global.jsonOutput = (argv.outputtype=="json");

//
// Initialize the caches
//
if (!passwd.loadData( argv.passwdfile ) )//|| groups.loadData( argv.groupsFile
  return;

//
// Routers
//
app.get('/users', usersHandler);
app.get('/users/:uid', usersHandler);

// app.get('/user', (req, res) => {
//   console.log( '>>>>> res :', res );
//   // res.send ( passwd.getUsers );
// });

app.listen(argv.port, () => {
  console.log(`App listening on port ${argv.port}`)
});

//
// Route handlers
//
function usersHandler ( req, res, next )
{
console.log("req.params :", req.params, !isNaN(req.params.uid));
  if ( !isNaN(req.params.uid))
  {
    // uid was provided, overwrite query parameters
    //  and search just for uid
    req.query = {uid: req.params.uid};
  }
console.log("req.query :", req.query);

  result = passwd.getUsers(req.query);
  if (result.length == 0 )
  {
    res.status(404).send('404 - Not found');
  }
  else
  {
    if (global.jsonOutput)
      res.send ( result );
    else
      res.send ( "<pre>" + JSON.stringify(result, null, 2 ) + "</pre>" );
  }
}

// function prettyJ(json) {
//   if (typeof json !== 'string') {
//     json = JSON.stringify(json, undefined, 2);
//   }
//   return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, 
//     function (match) {
//       let cls = "\x1b[36m";
//       if (/^"/.test(match)) {
//         if (/:$/.test(match)) {
//           cls = "\x1b[34m";
//         } else {
//           cls = "\x1b[32m";
//         }
//       } else if (/true|false/.test(match)) {
//         cls = "\x1b[35m"; 
//       } else if (/null/.test(match)) {
//         cls = "\x1b[31m";
//       }
//       return cls + match + "\x1b[0m";
//     }
//   );
// }
