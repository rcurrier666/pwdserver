///////////////////////////////////////////////////////////////////////
//
// loadpasswd.js
//
// Module containing functions to read and return users
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
      keys = [ "name", "x", "uid", "gid", "comment", "home", "shell" ];

var uid2pwdata = { },
    user2uid = { };

module.exports = {
  //
  // Verify passwd file exists, set file changed watch callback
  //  and do initial file load
  //
  // Inputs:  path to passwd file
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
      console.error( `${err}` );
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

  //
  // Read passwd file from disk, parse, and save in cache
  //
  // Inputs:  path to passwd file
  // Returns: None
  //
  loadDataEx: function ( filename )
  {
    if ( global.debug ) 
    {
      console.log ( `Loading passwd file ${filename}`);
    }

    uid2pwdata = { };  // Clear out old data
    user2uid = { };
    var instream = fs.createReadStream( filename ),
        outstream = new ( require ( 'stream' ) ) ( ),
        rl = readline.createInterface ( instream, outstream );
      rl.on ( 'line', ( line ) => {
        module.exports.parseLine ( line );
      });

      rl.on ( 'close', ( line ) => {
        if ( line ) {
          module.exports.parseLine ( line );
        }

        if ( global.debug ) 
        {
          console.log( 'Finished loading passwd file' );
          console.log( 'uid2pwdata :', uid2pwdata );
          console.log( 'user2uid :', user2uid );
        }
      });

      return;
  },

  //
  // Parse a line from the passwd file
  //
  // Inputs:  line of text
  // Returns: None
  //
  parseLine: function ( line )
  {
    var data = line.split( ":" ),
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

    uid2pwdata [ jsonData.uid ] = jsonData;
    user2uid [ jsonData.name ] = jsonData.uid;

    return;
  },

  //
  // Get a list of users that meet a specific criteria
  //
  // Inputs:  Array of key/value pairs that represent the required criteria
  // Returns: Array of key/value pairs for each user that meets the criteria
  //          Empty array if no users found
  //
  getUsers: function ( query )
  {
    if ( global.debug ) 
      {
        console.log ( `getUsers: query =`, query);
      }

    for ( var name in query )   // This just checks if query has any properties
    {
      // Convert any numeric strings to numbers
      _.forEach ( query, ( value, key ) => {
        if ( !isNaN ( value ) )
          query [ key ] = Number ( value );
      });
      
      if ( global.debug )
      {
        console.log ( 'HTTP query =', query );
      }

      return _.filter ( uid2pwdata, query );
    }

    // query is empty - return all users
    var result = [ ];
    for ( var key in uid2pwdata )
    {
      result.push ( uid2pwdata [ key ] );
    }

    return result;
  },

  //
  // Get the user that has a specific UID
  //
  // Inputs:  UID for requested user
  // Returns: Array of key/value pairs for the user
  //          Empty array if user not found
  //
  getUserByUID: function ( uid )
  {
    return uid2pwdata [ uid ];
  }

};
