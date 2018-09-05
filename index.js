/*jshint esversion: 6 */ 
/*jshint node: true */

const express = require( 'express' );
const app = express();
const passwd = require( './loadpasswd.js' );
const group = require( './loadgroup.js' );

//
// Configure options
//
argv = require('yargs')
.usage('$0 [options]')
  .options({
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
      choices: ['json', 'text'],
      nargs: 1,
      requiresArg: true,
      type: 'string'
    },
    'p': {
      alias: 'passwdfile',
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
  })
  .argv;

global.debug = argv.debug;
global.jsonOutput = (argv.outputtype=="json");

if (!argv.nowarn && (argv.passwdfile == '/etc/passwd' || argv.groupfile == '/etc/group'))
{
  console.warn(
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
  process.exit(1);
}

//
// Routers
//
app.get('/users', usersHandler);
app.get('/users/query', usersHandler);
app.get('/users/:uid', usersHandler);
app.get('/users/:uid/groups', usersGroupsHandler);
app.get('/groups', groupsHandler);
app.get('/groups/query', groupsHandler);
app.get('/groups/:gid', groupsHandler);

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
// console.error(">>> req :", req);
// console.log(">>> path :", req.route.path);
// console.log("req.params :", req.params, !isNaN(req.params.uid));
  if ( !req.route.path.includes("query") )
  {
    req.query = {};
  }

  if ( !isNaN(req.params.uid) )
  {
    // uid was provided, overwrite query parameters
    //  and search just for uid
    req.query = {uid: req.params.uid};
  }
// console.log("req.query :", req.query);

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

function usersGroupsHandler ( req, res, next )
{
  user = passwd.getUserByUID(req.params.uid);
  if (!user)
  {
console.error(`uid ${req.params.uid} not found`);
    res.status(404).send('404 - User not found');
  }
  else
  {
console.log('uid:', req.params.uid);
console.log('name:', user.name);
    query = { member: user.name};
    result = group.getUsers(query);
console.log('groups:', result);

    if (global.jsonOutput)
      res.send ( result );
    else
      res.send ( "<pre>" + JSON.stringify(result, null, 2 ) + "</pre>" );
  }
}

function groupsHandler ( req, res, next )
{
// console.error(">>> req :", req);
// console.log(">>> path :", req.route.path);
// console.log("req.params :", req.params, !isNaN(req.params.gid));
  if ( !req.route.path.includes("query") )
  {
    req.query = {};
  }

  if ( !isNaN(req.params.gid))
  {
    // uid was provided, overwrite query parameters
    //  and search just for uid
    req.query = {gid: req.params.gid};
  }
// console.log("req.query :", req.query);

  result = group.getUsers(req.query);
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
