/*jshint esversion: 6 */ 
/*jshint node: true */

const _ = require ( 'lodash' );
const fs = require ( 'fs' ),
      readline = require ( 'readline' ),
      keys = ["name", "x", "gid", "members"];

var groupdata = {};

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
    if (global.debug) console.log ( `Loading group file ${filename}`);

    groupdata = {};  // Clear out old data

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
          console.log('Finished loading group file');
          console.log('groupdata :', groupdata );
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

// console.log('members is :', jsonData.members, typeof(jsonData.members));
    if (_.isString(jsonData.members))
    {
    // Convert members collection to array
// console.log('Before members array :', jsonData.members );
    // jsonData.members = Array.from ( jsonData.members );
    jsonData.members = jsonData.members.split ( ',' );
// console.log('After members array :', jsonData.members );
    }
    else
    {
      jsonData.members = [];
    }
    groupdata[jsonData.gid] = jsonData;

    return;
  },

  getUsers: function (query)
  {
    var members = [];
    var searchArray = groupdata;
    var result = [];

    if (global.debug) console.log ( `getUsers: query =`, query);
    for (var placeholder in query)   // This just checks if query has any properties
    {
      if (query.member)
      {
        // .filter doesn't work on an embedded arry so save and strip out
        //   member query to handle separately
//console.log("removing members from query");
//console.log("<<<<< query.memberis Array:", _.isArray(query.member), "length:", query.member.length);
        if (_.isArray(query.member))
        {
          members = query.member;
        }
        else
        {
          members[0] = query.member;
        }
        delete query.member;

        searchArray = [];
        if (global.debug) console.log ( `getUsers: query =`, query, "members =", members, "type =", typeof(members));
        for (var group in groupdata)
        {
          if ( members.every( (m) => 
          {
// console.log(">>>member :", m, ", group :", groupdata[group].members);
            return ( _.indexOf(groupdata[group].members, m) != -1 );
          }))
          {
            searchArray.push(groupdata[group]);
// console.log("Pushing ", groupdata[group]);
          }
        }
      }
// console.log("After member filtering :", searchArray);
    }

      // Convert any numeric strings to numbers
      _.forEach ( query, (value, key) => {
        if ( !isNaN ( value ) )
          query[key] = Number ( value );
      });

      if (global.debug) console.log ( 'groupdata =', groupdata );
      result = _.filter ( searchArray, query );
      if (global.debug) console.log ( 'result =', result);
      return result;
    

    // query is empty - return all users
    for (var key in groupdata)
    {
      result.push(groupdata[key]);
    }

    return result;
  },

};

// checkQuery: function (query)
// {

// }
