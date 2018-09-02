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
app.get('/users', (req, res) => {
  if (global.jsonOutput)
   res.send ( passwd.getUsers(req.query) );
 else
   res.send ( "<pre>" + JSON.stringify(passwd.getUsers(req.query), null, 2 ) + "</pre>" );
});

app.get('/user', (req, res) => {
  console.log( '>>>>> res :', res );
  // res.send ( passwd.getUsers );
});

app.listen(argv.port, () => {
  console.log(`App listening on port ${argv.port}`)
});

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
