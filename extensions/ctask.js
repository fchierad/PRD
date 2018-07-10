/**
 * ctask - PRD extension, usable on the form only.<br/>
 * C.R.U.D. interface to store form information in memory for ease of coding/debugging.<br/>
 * Module loads as PRD.extensions.ctask<br/>
 * @module ctask
 * @requires PRD
 * @version Alpha
 * @license MIT License
 */
(function IIFE() {
  var arr, major, minor, patch, storage, logmsg, dbgmsg, isString, mainpartitionname;
  storage = {};
  mainpartitionname = 'ctask_main_partition';

  /* internal data structure (proposal):
  - storage:{ partition_ids }
  - partition_id:{ name:id, type:'', data:{ entries } } // type:'basic' does not use entry permissions. type:'extended' uses entry permissions.
  - data:{
      entry_uuid:{ permissions:{}, properties:{} }
    }
  - permissions: to be defined
  - properties:{ property_name:property_value }

  v1.0.0 will be released with only partition type = 'basic', that will also be the default value*/

    // Validates we have the PRD module loaded, and if so extendes it with ctask
    if ( window != null ) {
      if ( window.PRD != null && PRD.hasOwnProperty( 'version' ) ) {
        arr = PRD.version().split( '.' );
        major = Number( arr[ 0 ] );
        minor = Number( arr[ 1 ] );
        patch = Number( arr[ 2 ] );
        if ( major === 1 && ( minor > 0 || ( minor === 0 && patch >= 6 )) ) {
          if ( ! PRD.hasOwnProperty( 'extensions' ) ) {
            PRD.extensions = {};
          }
          if ( ! PRD.hasOwnProperty( 'ctask' ) ) {
            PRD.extensions.ctask = partition_create( mainpartitionname, 'basic' );
            PRD.extensions.ctask.listpartitions = listpartitions;
            PRD.extensions.ctask.partitionexists = partition_exists;
            PRD.extensions.ctask.createpartition = partition_create;
            PRD.extensions.ctask.destroypartition = partition_destroy;
            // Function abstractions for easier refactoring
            logmsg = PRD.util.logerror;
            dbgmsg = PRD.util.debugmsg;
            isString = PRD.util.isString;
            isNumber = PRD.util.isNumber;
            isBoolean = PRD.util.isBoolean;
            logmsg( 'Module loaded: PRD.extensions.cdata version ' + version() );
          }
        } else {
          console.log( 'Incorrect PRD module version. Requires 1.0.6 or later, found: ' + arr.join( '.' ) );
        }
      } else {
        console.log( 'PRD module not loaded.' );
        // Loading ctask without PRD. Debug messages always print to console in this mode.
        logmsg = console.log;
        dbgmsg = console.log;
        isString = function (i) {return ( typeof i === 'string' || ( typeof i === 'object' && i instanceof String ) ); };
        isNumber = function (i) {return ( typeof i === 'number' || ( typeof i === 'object' && i instanceof Number ) ); };
        isBoolean = function (i) {return ( typeof i === 'boolean' || ( typeof i === 'object' && i instanceof Boolean ) ); };
        window.ctask = partition_create( 'ctask_main_partition', 'basic' );
        window.ctask.listpartitions = listpartitions;
        window.ctask.partitionexists = partition_exists;
        window.ctask.createpartition = partition_create;
        window.ctask.destroypartition = partition_destroy;
      }
    }

  /**
   * Return extension version.
   * @memberof module:ctask
   * @since 1.0.0
   *
   * @type {string}
   * @return {string} Module's version in the format M.m.p (Major, minor, patch)
   */
  function version() {
    return 'Alpha 1';
  }

  // === Partition ===

  /**
   * Display all data partitions created.
   * @memberof module:ctask
   * @since 1.0.0
   *
   * @type {string[]}
   * @return {string[]} Array containing all data partition names.
   */
  function listpartitions() {
    return Object.keys( storage ).sort().slice();
  }

  /**
   * Check if a given partition exists.
   * @function partitionexists
   * @memberof module:ctask
   * @since 1.0.0
   *
   * @param {string} id partition internal name/identifier
   * @type {boolean}
   * @return {boolean} true if there is a partition with that id, false otherwise.
   */
  function partition_exists( id ) {
    return storage.hasOwnProperty( String( id ) );
  }

  /**
   * Creates a data partition.
   * @function createpartition
   * @memberof module:ctask
   * @since 1.0.0
   *
   * @param {string}  id      partition internal name/identifier
   * @param {string=} [type]  'basic' is the only supported value at this moment. Defaults to 'basic'
   * @type {object}
   * @return {object} Partition reference with API wrapper to manipulate its data. null if partition creation failed.
   */
  function partition_create( id, type ) {
    var validtypes;
    validtypes = [ 'basic' ]; // 'extended' is the next to be implemented in the future
    id = String( id );
    if ( type == null || ! isString( type ) || validtypes.indexOf( type ) === -1 ) {
      type = 'basic';
    }
    if ( partition_exists( id ) ) {
      logmsg( 'ctask: Failed to create new data partition, partition already exists: ' + id );
      return null;
    }
    // Instantiates data partition
    storage[ id ] = {
      name:id, // partition name
      type:type, // partition type
      data:{} // entry storage
    };

    return new_partition( id );
  }

  /**
   * Destroy a data partition.
   * @function destroypartition
   * @memberof module:ctask
   * @since 1.0.0
   *
   * @param {string} id partition internal name/identifier
   * @type {boolean}
   * @return {boolean} true if the partition has been destroyed, false otherwise.
   */
  function partition_destroy( id ) {
    id = String( id );
    if ( id === mainpartitionname ) {
      dbgmsg( 'Main partition "' + mainpartitionname + '" cannot be destroyed.' );
      return false;
    }
    if ( partition_exists( id ) ) {
      // Delete storage partition
      delete storage[ id ];
    }
    return ! partition_exists( id );
  }

  /**
   * Returns the partition's Entry API
   * @param {string} id partition internal name/identifier
   * @type {object}
   * @return {object} Entry API object
   */
  function new_partition( id ) {
    var partition_ref, destroyed, destroyedmsg, PartitionAPI;
    id = String( id );
    partition_ref = storage[ id ]; // Used by the child functions returned in the API
    destroyedmsg = 'Partition "' + id + '" has been destroyed. Aborting function execution.';
    destroyed = false;
    PartitionAPI = {
      name:id,
      listentries:listentries,
      has:entry_has,
      add:entry_add,
      remove:entry_remove,
      read:entry_read,
      readAll:entry_readAll,
      getEntryReference:getEntryReference,
      hasproperty:property_has,
      addproperty:property_add,
      updateproperty:property_update,
      removeproperty:property_remove,
      readproperty:property_read,
    };
    // Main partition cannot be destroyed
    if ( id !== mainpartitionname ) {
      PartitionAPI.destroy = destroy;
    }
    return PartitionAPI;

    /**
     * Destroy a data partition.
     * @type {boolean}
     * @return {boolean} true if the partition has been destroyed, false otherwise.
     */
    function destroy() {
      if ( id === mainpartitionname ) {
        dbgmsg( 'Main partition "' + mainpartitionname + '" cannot be destroyed.' );
        return false;
      }
      if ( partition_exists( id ) ) {
        // Delete storage partition
        destroyed = true;
        delete storage[ id ];
      }
      return ! partition_exists( id );
    }

    // Entry functions

    /**
     * Returns reference to entry location
     * @type {object}
     * @return {object} reference to entry location
     */
    function entry_data_ref() {
      return partition_ref.data;
    }

    /**
     * Validate that partition has not been destroyed outside of the returned object. Returns nothing.
     */
    function partition_valid() {
      if ( ! destroyed && ! partition_exists( id ) ) {
        destroyed = true;
      }
    }

    /**
     * Display all entries on this partition
     * @type {string[]}
     * @return {string[]} Array with uuid values of all entries in this partition
     */
    function listentries() {
      partition_valid();
      if ( destroyed ) {
        logmsg( destroyedmsg );
        return [];
      }
      return Object.keys( entry_data_ref() ).sort().slice();
    }

    /**
     * Evaluate if the entry exists in the current partition.
     * @param {string} uuid entry unique identifier.
     * @type {boolean}
     * @return {boolean} true if entry exists in partition, false otherwise.
     */
    function entry_has( uuid ) {
      partition_valid();
      if ( destroyed ) {
        logmsg( destroyedmsg );
        return false;
      }
      return entry_data_ref().hasOwnProperty( String( uuid ) );
    }

    /**
     * Add entry named by uuid's value to partition
     * @param {string} uuid entry unique identifier.
     * @type {boolean}
     * @return {boolean} true if successful, false otherwise.
     */
    function entry_add( uuid ) {
      partition_valid();
      if ( destroyed ) {
        logmsg( destroyedmsg );
        return false;
      }
      uuid = String( uuid );
      if ( entry_has( uuid ) ) {
        dbgmsg( 'ctask: attempted to create an entry (' + uuid + ') that already exists in this partition.' );
        return false;
      }
      entry_data_ref()[ uuid ] = {
        permissions:{}, // Only used in 'extended' partitions
        properties:{}, // Entry properties
      };
      return entry_has( uuid );
    }

    /**
     * Remove entry named by uuid's value from partition.
     * @param {string} uuid entry unique identifier.
     * @type {boolean}
     * @return {boolean} true if successful, false otherwise.
     */
    function entry_remove( uuid ) {
      partition_valid();
      if ( destroyed ) {
        logmsg( destroyedmsg );
        return false;
      }
      uuid = String( uuid );
      if ( entry_has( uuid ) ) {
        delete entry_data_ref()[ uuid ];
        return ! entry_has( uuid );
      }
      dbgmsg( 'ctask: attempted to delete an entry that does not exist in this partition.' );
      return false;
    }

    /**
     * Returns an ECMA object with a copy of the entry's stored properties and their values.
     * @param {string} uuid entry unique identifier.
     * @type {object}
     * @return {object} ECMA object with a copy of the entry's stored properties and their values.
     */
    function entry_read( uuid ) {
      var entryProperties, entrycopy;
      partition_valid();
      if ( destroyed ) {
        logmsg( destroyedmsg );
        return {};
      }
      uuid = String( uuid );
      if ( entry_has( uuid ) ) {
        entrycopy = {};
        entryProperties = entry_data_ref()[ uuid ].properties;
        Object.keys( entryProperties ).forEach( function copyProperties( property ) {
          if ( entryProperties[ property ] instanceof Array ) {
            entrycopy[ property ] = entryProperties[ property ].slice();
          } else {
            entrycopy[ property ] = entryProperties[ property ];
          }
        });
        return entrycopy;
      }
      dbgmsg( 'ctask: attempted to read an entry that does not exist in this partition.' );
      return {};
    }

    /**
     * Reads all entries from the local partition
     * @type {object[]}
     * @return {object[]} Array of ECMA objects with all fields/properties related to the entry.
     *   The uuid property will be a string, all other properties will be returned as is.
     */
    function entry_readAll() {
      var all, entries;
      partition_valid();
      if ( destroyed ) {
        logmsg( destroyedmsg );
        return [];
      }

      all = [];
      entries = entry_data_ref();
      Object.keys( entries ).sort().forEach( function buildResult( uuid ) {
        var key, res, entry_properties;
        res = {};
        res.uuid = String( uuid );
        entry_properties = entries[ res.uuid ].properties;

        for ( key in entry_properties ) {
          if ( entry_properties[ key ] instanceof Array ) {
            res[ key ] = entry_properties[ key ].slice();
          } else {
            res[ key ] = entry_properties[ key ];
          }
        }
        all.push( res );
      });

      return all;
    }

    /**
     * Returns an ECMA object with the Entry API for the provided entry name.
     * @param {string} uuid entry unique identifier.
     * @type {object}
     * @return {object} ECMA object whose methods will modify the selected entry.
     */
    function getEntryReference( uuid ) {
      var EntryAPI;
      partition_valid();
      if ( destroyed ) {
        logmsg( destroyedmsg );
        return null;
      }
      uuid = String( uuid );
      if ( ! entry_has( uuid ) ) {
        dbgmsg( 'Attempt to create entry reference for an entry not present on the partition.' );
        return null;
      }
      EntryAPI = {
        name:uuid,
        has:property_has.bind( null, uuid ),
        add:property_add.bind( null, uuid ),
        update:property_update.bind( null, uuid ),
        remove:property_remove.bind( null, uuid ),
        read:property_read.bind( null, uuid ),
        listproperties:property_list.bind( null, uuid ),
      };
      return EntryAPI;
    }

    // Property functions

    /**
     * Evaluate if the property exists in the provided entry.
     * @param {string} uuid     entry unique identifier.
     * @param {string} property entry's property name.
     * @type {boolean}
     * @return {boolean} true if successful, false otherwise.
     */
    function property_has( uuid, property ) {
      var entryproperties, entrypermissions;
      partition_valid();
      if ( destroyed ) {
        logmsg( destroyedmsg );
        return false;
      }
      uuid = String( uuid );
      property = String( property );

      entryproperties = entry_data_ref()[ uuid ].properties;
      entrypermissions = entry_data_ref()[ uuid ].permissions;

      return entryproperties.hasOwnProperty( property );
    }

    /**
     * Add property to the entry with a null value. If entry does not exist will create the same.
     * @param {string} uuid     entry unique identifier.
     * @param {string} property entry's property name.
     * @type {boolean}
     * @return {boolean} true if successful, false otherwise.
     */
    function property_add( uuid, property ) {
      var entryproperties, entrypermissions;
      partition_valid();
      if ( destroyed ) {
        logmsg( destroyedmsg );
        return false;
      }
      uuid = String( uuid );
      property = String( property );
      // Make sure entry exists
      if ( ! entry_has( uuid ) ) {
        if ( ! entry_add( uuid ) ) {
          return false;
        }
      }

      entryproperties = entry_data_ref()[ uuid ].properties;
      entrypermissions = entry_data_ref()[ uuid ].permissions;

      if ( property_has( uuid, property ) ) {
        dbgmsg( 'Property "' + property + '" already exists in entry "' + uuid + '", aborting.' );
        return false;
      }
      entryproperties[ property ] = null;
      return property_has( uuid, property );
    }

    /**
     * Update entry's property with a value. Any value other than string, number, boolean, null or array will cause the function to abort.
     * @param {string}                             uuid     entry unique identifier.
     * @param {string}                             property entry's property name.
     * @param {(string|number|boolean|null|any[])} value    entry's property name.
     * @type {boolean}
     * @return {boolean} true if successful, false otherwise.
     */
    function property_update( uuid, property, value ) {
      var entryproperties, entrypermissions;
      partition_valid();
      if ( destroyed ) {
        logmsg( destroyedmsg );
        return false;
      }
      uuid = String( uuid );
      property = String( property );
      // Make sure entry exists
      if ( ! entry_has( uuid ) ) {
        property_add( uuid, property );
      }
      if ( !( value === null || isString( value ) || isNumber( value ) ||  isBoolean( value ) || value instanceof Array ) ) {
        dbgmsg( 'unsupported value parameter type. Aborting.' );
        return false;
      }

      entryproperties = entry_data_ref()[ uuid ].properties;
      entrypermissions = entry_data_ref()[ uuid ].permissions;

      if ( value instanceof Array ) {
        entryproperties[ property ] = value.slice();
      } else {
        entryproperties[ property ] = value;
      }

      return true;
    }

    /**
     * Removes completely an entry's property.
     * @param {string} uuid     entry unique identifier.
     * @param {string} property entry's property name.
     * @type {boolean}
     * @return {boolean} true if successful, false otherwise.
     */
    function property_remove( uuid, property ) {
      var entryproperties, entrypermissions;
      partition_valid();
      if ( destroyed ) {
        logmsg( destroyedmsg );
        return false;
      }
      uuid = String( uuid );
      property = String( property );
      // Make sure entry exists
      if ( ! entry_has( uuid ) ) {
        dbgmsg( 'Entry does not exist in the current partition. Aborting.' );
        return false;
      }

      entryproperties = entry_data_ref()[ uuid ].properties;
      entrypermissions = entry_data_ref()[ uuid ].permissions;

      delete entryproperties[ property ];

      return property_has( uuid, property );
    }

    /**
     * Read an entry's  property value.
     * @param {string} uuid          entry unique identifier.
     * @param {string} property      entry's property name.
     * @param {string} defaultvalue  Default value to be returned if the property is not present.
     * @type {*}
     * @return {*} undefined if uuid or property do not exist, property value otherwise..
     */
    function property_read( uuid, property, defaultvalue ) {
      var entryproperties, entrypermissions, res;
      partition_valid();
      if ( destroyed ) {
        logmsg( destroyedmsg );
        return void 0;
      }
      uuid = String( uuid );
      property = String( property );
      if ( ! entry_has( uuid ) ) {
        return void 0;
      }
      if ( ! property_has( uuid, property ) ) {
        return void 0;
      }

      entryproperties = entry_data_ref()[ uuid ].properties;
      entrypermissions = entry_data_ref()[ uuid ].permissions;

      if ( entryproperties[ property ] instanceof Array ) {
        res = entryproperties[ property ].slice();
      } else {
        res = entryproperties[ property ];
      }
      return res;
    }

    /**
     * List the entry's property names.
     * @param {string} uuid entry unique identifier.
     * @type {string[]}
     * @return {string[]} Array of Entry property names.
     */
    function property_list( uuid ) {
      var entryproperties, entrypermissions;
      partition_valid();
      if ( destroyed ) {
        logmsg( destroyedmsg );
        return [];
      }
      uuid = String( uuid );
      if ( ! entry_has( uuid ) ) {
        return [];
      }

      entryproperties = entry_data_ref()[ uuid ].properties;
      entrypermissions = entry_data_ref()[ uuid ].permissions;

      return Object.keys( entryproperties ).sort().slice();
    }
    // end of new_partition
  }
})();