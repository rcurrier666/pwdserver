///////////////////////////////////////////////////////////////////////
//
// loadgroups.js
//
// Module containing functions to read and return groups
//
// Date: 6 Sep 2018
// Author: Ron Currier
// Copyright 2018 by Sparkfish Heavy Industries
// License: MIT
// 
///////////////////////////////////////////////////////////////////////

/*jshint esversion: 6 */ 
/*jshint node: true */

const _ = require ( 'lodash' );
const fs = require ( 'fs' ),
      readline = require ( 'readline' ),
      keys = [ "name", "x", "gid", "members" ];

var groupdata = { };

module.exports = {
  //
  // Verify group file exists, set file changed watch callback
  //  and do initial file load
  //
  // Inputs:  path to group file
  // Returns: true if file successfully parsed, else false
  //
  loadData: function ( filename )
  {
    loading = false;
    try
    {
      fs.accessSync ( filename );
    }
    catch ( err )
    {
      console.error ( `${err}` );
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
    } );

    module.exports.loadDataEx ( filename );

    return true;
  },

  //
  // Read group file from disk, parse, and save in cache
  //
  // Inputs:  path to group file
  // Returns: None
  //
  loadDataEx: function ( filename )
  {
    if ( global.debug ) 
    {
      console.log ( `Loading group file ${filename}` );
    }

    groupdata = { };  // Clear out old data

    var instream = fs.createReadStream( filename ),
        outstream = new ( require ( 'stream' ) ) ( ),
        rl = readline.createInterface ( instream, outstream );
      rl.on ( 'line', ( line ) => {
        module.exports.parseLine ( line );
      } );

      rl.on ( 'close', ( line ) => {
        if ( line ) {
          module.exports.parseLine ( line );
        }
        if ( global.debug ) 
        {
          console.log ( 'Finished loading group file' );
          console.log ( 'groupdata :', groupdata );
        }
      } );

      return;
  },

  //
  // Parse a line from the group file
  //
  // Inputs:  line of text
  // Returns: None
  //
  parseLine: function ( line )
  {
    var data = line.split ( ":" ),
        jsonData = { };

    for ( var i = 0; i < data.length; i++ )
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

    if  ( _.isString ( jsonData.members ) )
    {
      // Convert members collection to array
      jsonData.members = jsonData.members.split ( ',' );
    }
    else
    {
      jsonData.members = [ ];
    }
    groupdata [ jsonData.gid ] = jsonData;

    return;
  },

  //
  // Get a list of groups that meet a specific criteria
  //
  // Inputs:  Array of key/value pairs that represent the required criteria
  // Returns: Array of key/value pairs for each group that meets the criteria
  //          Empty array if no users found
  //
  getGroups: function ( query )
  {
    var members = [ ];
    var searchArray = groupdata;
    var result = [ ];

    if ( global.debug ) 
    {
      console.log ( `getUsers: query =`, query );
    }

    for ( var placeholder in query )   // This just checks if query has any properties
    {
      if ( query.member )
      {
        // .filter doesn't work on an embedded arry so save and strip out
        //   member query and handle separately
        if ( _.isArray ( query.member ) )
        {
          members = query.member;
        }
        else
        {
          members [ 0 ] = query.member;
        }
        delete query.member;

        searchArray = [ ];
        if ( global.debug ) 
        {
          console.log ( `getUsers: query =`, query, "members =", members, "type =", typeof ( members ) );
        }

        for ( var group in groupdata )
        {
          if ( members.every ( (  member ) => 
            {
              return ( _.indexOf(groupdata [ group ].members, member ) != -1 );
            } ) )
          {
            searchArray.push ( groupdata [ group ] );
          }
        }
      }
    }

      // Convert any numeric strings to numbers
      _.forEach ( query, ( value, key ) => {
        if ( !isNaN ( value ) )
          query [ key ] = Number ( value );
      } );

      if ( global.debug ) 
      {
        console.log ( 'groupdata =', groupdata );
      }

      result = _.filter ( searchArray, query );
      
      if ( global.debug ) 
      {
        console.log ( 'result =', result );
      }

      return result;
    
    // query is empty - return all users
    for ( var key in groupdata )
    {
      result.push ( groupdata [ key ] );
    }

    return result;
  }

};
