/*jshint esversion: 6 */ 
/*jshint node: true */

const _ = require ( 'lodash' );
const fs = require ( 'fs' ),
      readline = require ( 'readline' ),
      keys = ["name", "x", "uid", "gid", "comment", "home", "shell"];

var uid2pwdata = {},
    user2uid = {};

module.exports = {
  loadData: function (filename)
  {
    loading = false;
    try
    {
      fs.accessSync ( filename );
    }
    catch ( err )
    {
      console.error(`${err}`);
      return false;
    }

    fs.watch ( filename, ( eventType, file ) => {
    //   console.log( ' event type is :', eventType);
    //   if (filename) {
    //     console.log(`filename provided: ${filename}`);
    //   } else {
    //     console.log('filename not provided');
    //   }
      if ( eventType == 'change' && !loading )
      {
        loading = true;
        module.exports.loadDataEx ( filename );
      }
      else
      {
        setTimeout ( ( ) => {
          loading = false;
        }, 100 );
      }
    });

    module.exports.loadDataEx ( filename );

    return true;
  },

  loadDataEx: function (filename)
  {
    if (global.debug) console.log ( `Loading passwd file ${filename}`);

    uid2pwdata = {};  // Clear out old data
    user2uid = {};
    var instream = fs.createReadStream( filename ),
        outstream = new (require ( 'stream' ) ) ( ),
        rl = readline.createInterface ( instream, outstream );
      rl.on ( 'line', (line) => {
        module.exports.parseLine ( line );
      });

      rl.on ( 'close', (line) => {
        if (line) {
          module.exports.parseLine ( line );
        }
        if (global.debug) 
        {
          console.log('Finished loading passwd file');
          console.log('uid2pwdata :', uid2pwdata );
          console.log('user2uid :', user2uid );
        }
      });
  },

  parseLine: function ( line )
  {
    var data = line.split(":"),
        jsonData = {};

    for (var i = 0; i < data.length; i++)
    {
      if ( keys [ i ] != 'x' )
      {
        if ( isNaN ( data [ i ] ) )
        {
          jsonData [keys [ i ] ] = data [ i ];
        }
        else
        {
          jsonData[ keys [ i ] ] = Number ( data [ i ] );
        }
      }
    }

    uid2pwdata[jsonData.uid] = jsonData;
    user2uid[jsonData.name] = jsonData.uid;

    return;
  },

  getUsers: function (query)
  {
    if (global.debug) console.log ( `getUsers: query =`, query);
    for (var name in query)   // This just checks if query has any properties
    {
      // Convert any numeric strings to numbers
      _.forEach ( query, (value, key) => {
        if ( !isNaN ( value ) )
          query[key] = Number ( value );
      });
      if (global.debug) console.log('HTTP query =', query);
      return _.filter ( uid2pwdata, query );
    }

    // query is empty - return all users
    var result = [];
    for (var key in uid2pwdata)
    {
      result.push(uid2pwdata[key]);
      // result.push(JSON.stringify(uid2pwdata[key]));
    }

    return result;
  },

  // getUser: function ( user )
  // {
  //   return uid2pwdata.user2uid.user;
  // },

  getUserByUID: function ( uid )
  {
    return uid2pwdata[uid];
  }

};

// checkQuery: function (query)
// {

// }
