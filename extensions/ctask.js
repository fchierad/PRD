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
  'use strict';
  var arr, major, minor, patch, initref, storage, logmsg, dbgmsg, isString, isNumber, isBoolean, mainpartitionname, msgprefix;
  storage = {};
  mainpartitionname = 'ctask_main_partition';
  msgprefix = 'ctask: '; // Prefix for module's logmsg & dbgmsg function calls.

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
  if ( window ) {
    if ( window.PRD && PRD.version ) {
      arr = PRD.version().split( '.' );
      major = Number( arr[ 0 ] );
      minor = Number( arr[ 1 ] );
      patch = Number( arr[ 2 ] );
      if ( major === 1 && ( minor > 0 || ( minor === 0 && patch >= 6 )) ) {
        if ( ! PRD.extensions ) {
          PRD.extensions = {};
        }
        if ( ! PRD.extensions.ctask ) {
          PRD.extensions.ctask = partition_create( msgprefix, storage, mainpartitionname, 'basic' );
          initref = PRD.extensions.ctask;
          // Function abstractions for easier refactoring
          logmsg = PRD.util.logerror;
          dbgmsg = PRD.util.debugmsg;
          isString = PRD.util.isString;
          isNumber = PRD.util.isNumber;
          isBoolean = PRD.util.isBoolean;
          logmsg( 'Module loaded: PRD.extensions.ctask version ' + version() );
        }
      } else {
        console.log( 'Incorrect PRD module version. Requires 1.0.6 or later, found: ' + arr.join( '.' ) ); //eslint-disable-line
      }
    } else {
      console.log( 'PRD module not loaded.' ); //eslint-disable-line
      // Loading ctask without PRD. Debug messages always print to console in this mode
      if ( ! window.ctask ) {
        logmsg = console.log; //eslint-disable-line
        dbgmsg = console.log; //eslint-disable-line
        isString = function (i) {return ( typeof i === 'string' || ( typeof i === 'object' && i instanceof String ) ); };
        isNumber = function (i) {return ( typeof i === 'number' || ( typeof i === 'object' && i instanceof Number ) ); };
        isBoolean = function (i) {return ( typeof i === 'boolean' || ( typeof i === 'object' && i instanceof Boolean ) ); };
        window.ctask = partition_create( msgprefix, storage, mainpartitionname, 'basic' );
        initref = window.ctask;
      }
    }
    if ( initref ) {
      initref.listpartitions = listpartitions.bind( null, msgprefix, storage );
      initref.partitionexists = partition_exists.bind( null, msgprefix, storage );
      initref.createpartition = partition_create.bind( null, msgprefix, storage );
      initref.destroypartition = partition_destroy.bind( null, msgprefix, storage, mainpartitionname );
      initref.navigatepartition = getPartitionReference.bind( null, msgprefix, storage, mainpartitionname, 'readonly' );
    }
  }

  /**
   * Return extension version.
   * @type {string}
   * @return {string} Module's version in the format M.m.p (Major, minor, patch)
   */
  function version() {
    return 'Alpha 7';
  }

  // === Partition ===

  /**
   * Display all data partitions created.
   * @param {string} prefix  Prefix added to any log messages
   * @param {string} dstore  Data store to be used for the partitions
   * @type {string[]}
   * @return {string[]} Array containing all data partition names.
   */
  function listpartitions( prefix, dstore ) {
    if ( dstore != null && typeof dstore !== 'object' ) {
      logmsg( prefix + 'Data Store paramater passed does not contain an ECMA object. Aborting.' );
      return [];
    }
    return Object.keys( dstore ).sort().slice();
  }

  /**
   * Check if a given partition exists.
   * @param {string} prefix  Prefix added to any log messages
   * @param {string} dstore  Data store to be used for the partitions
   * @param {string} id partition internal name/identifier
   * @type {boolean}
   * @return {boolean} true if there is a partition with that id, false otherwise.
   */
  function partition_exists( prefix, dstore, id ) {
    if ( dstore != null && typeof dstore !== 'object' ) {
      logmsg( prefix + 'Data Store paramater passed does not contain an ECMA object. Aborting.' );
      return false;
    }
    return dstore.hasOwnProperty( String( id ) );
  }

  /**
   * Creates a data partition.
   * @param {string}  prefix  Prefix added to any log messages
   * @param {string}  dstore  Data store to be used for the partitions
   * @param {string}  id      partition internal name/identifier
   * @param {string=} [type]  'basic' is the only supported value at this moment. Defaults to 'basic'
   * @type {object}
   * @return {object} Partition reference with API wrapper to manipulate its data. null if partition creation failed.
   */
  function partition_create( prefix, dstore, id, type ) {
    var validtypes, newprefix;
    validtypes = [ 'basic' ]; // 'extended' is the next to be implemented in the future
    id = String( id );
    if ( dstore != null && typeof dstore !== 'object' ) {
      logmsg( prefix + 'Data Store paramater passed does not contain an ECMA object. Aborting.' );
      return null;
    }
    if ( type == null || ! isString( type ) || validtypes.indexOf( type ) === -1 ) {
      type = 'basic';
    }
    if ( partition_exists( prefix, dstore, id ) ) {
      logmsg( prefix + 'Failed to create new data partition, partition already exists: ' + id );
      return null;
    }
    // Instantiates data partition
    dstore[ id ] = {
      name:id, // partition name
      type:type, // partition type
      data:{} // entry storage
    };
    newprefix =  prefix + id + ': ';

    return getPartitionReference( newprefix, dstore, mainpartitionname, 'full', id );
  }

  /**
   * Destroy a data partition.
   * @param {string} prefix Prefix added to any log messages
   * @param {string} dstore Data store to be used for the partitions
   * @param {string} main   Name of the main data partition that should never be destroyed
   * @param {string} id     partition internal name/identifier
   * @type {boolean}
   * @return {boolean} true if the partition has been destroyed, false otherwise.
   */
  function partition_destroy( prefix, dstore, main, id ) {
    id = String( id );
    if ( dstore != null && typeof dstore !== 'object' ) {
      logmsg( prefix + 'Data Store paramater passed does not contain an ECMA object. Aborting.' );
      return false;
    }
    if ( id === main ) {
      dbgmsg( prefix + 'Main partition "' + main + '" cannot be destroyed.' );
      return false;
    }
    if ( ! partition_exists( prefix, dstore, id ) ) {
      dbgmsg( prefix + 'Could not find partition "' + id + '".' );
      return false;
    }

    delete storage[ id ];

    return ! partition_exists( prefix, dstore, id );
  }

  // Entry functions

  /**
   * Returns reference to a data partition
   * @param {string} prefix  Prefix added to any log messages
   * @param {string} dstore  Data store to be used for the partitions
   * @param {string} id      partition internal name/identifier
   * @type {object}
   * @return {object} reference to dapa partition, null if failed.
   */
  function partition_reference( prefix, dstore, id ) {
    var ref;
    if ( dstore != null && typeof dstore !== 'object' ) {
      logmsg( prefix + 'Data Store paramater passed does not contain an ECMA object. Aborting.' );
      return null;
    }
    if ( ! partition_exists( prefix, dstore, id ) ) {
      dbgmsg( prefix + 'Could not find partition "' + id + '".' );
      return null;
    }
    // Check partition expected structure
    ref = dstore[ id ];
    if ( !( ref.hasOwnProperty( 'name' ) && ref.hasOwnProperty( 'type' ) && ref.hasOwnProperty( 'data' ) ) ) {
      dbgmsg( prefix + 'Partition: "' + id + '" does not contain the expected structure. Aborting.' );
      return null;
    }
    return ref;
  }

  /**
   * Returns reference to entry location inside the current partition
   * @param {string} prefix  Prefix added to any log messages
   * @param {string} dstore  Data store to be used for the partitions
   * @param {string} id      partition internal name/identifier
   * @type {object}
   * @return {object} reference to entry location
   */
  function entry_data_ref( prefix, dstore, id ) {
    var partition_ref, entry_data;
    partition_ref = partition_reference( prefix, dstore, id );
    entry_data = partition_ref.data;
    return entry_data;
  }

  /**
   * Returns reference to a single entry's property list
   * @param {string} prefix  Prefix added to any log messages
   * @param {string} dstore  Data store to be used for the partitions
   * @param {string} id      partition internal name/identifier
   * @param {string} uuid    entry unique identifier.
   * @type {object}
   * @return {object} reference to entry location
   */
  function entry_properties_ref( prefix, dstore, id, uuid ) {
    var entry_data, entry_properties;
    entry_data = entry_data_ref( prefix, dstore, id );
    entry_properties = entry_data[ uuid ].properties;
    return entry_properties;
  }

  /**
   * Display all entries on this partition
   * @param {string} prefix  Prefix added to any log messages
   * @param {string} dstore  Data store to be used for the partitions
   * @param {string} id      partition internal name/identifier
   * @type {string[]}
   * @return {string[]} Array with uuid values of all entries in this partition
   */
  function listentries( prefix, dstore, id ) {
    var entries;
    if ( ! partition_exists( prefix, dstore, id ) ) {
      return [];
    }
    entries = entry_data_ref( prefix, dstore, id );
    return Object.keys( entries ).sort().slice();
  }

  /**
   * Evaluate if the entry exists in the current partition.
   * @param {string} prefix  Prefix added to any log messages
   * @param {string} dstore  Data store to be used for the partitions
   * @param {string} id      partition internal name/identifier
   * @param {string} uuid    entry unique identifier.
   * @type {boolean}
   * @return {boolean} true if entry exists in partition, false otherwise.
   */
  function entry_has( prefix, dstore, id, uuid ) {
    var entries;
    if ( ! partition_exists( prefix, dstore, id ) ) {
      return false;
    }
    entries = entry_data_ref( prefix, dstore, id );
    return entries.hasOwnProperty( String( uuid ) );
  }

  /**
   * Add entry named by uuid's value to partition
   * @param {string} prefix  Prefix added to any log messages
   * @param {string} dstore  Data store to be used for the partitions
   * @param {string} id      partition internal name/identifier
   * @param {string} uuid    entry unique identifier.
   * @type {boolean}
   * @return {boolean} true if successful, false otherwise.
   */
  function entry_add( prefix, dstore, id, uuid ) {
    var entries;
    if ( ! partition_exists( prefix, dstore, id ) ) {
      return false;
    }
    uuid = String( uuid );
    if ( entry_has( prefix, dstore, id, uuid ) ) {
      dbgmsg( prefix + 'attempted to create an entry (' + uuid + ') that already exists in this partition.' );
      return false;
    }
    entries = entry_data_ref( prefix, dstore, id );
    entries[ uuid ] = {
      //permissions:{}, // Only used in 'extended' partitions
      properties:{} // Entry properties
    };
    return entry_has( prefix, dstore, id, uuid );
  }

  /**
   * Remove entry named by uuid's value from partition.
   * @param {string} prefix  Prefix added to any log messages
   * @param {string} dstore  Data store to be used for the partitions
   * @param {string} id      partition internal name/identifier
   * @param {string} uuid    entry unique identifier.
   * @type {boolean}
   * @return {boolean} true if successful, false otherwise.
   */
  function entry_remove( prefix, dstore, id, uuid ) {
    var entries;
    if ( ! partition_exists( prefix, dstore, id ) ) {
      return false;
    }
    uuid = String( uuid );
    if ( ! entry_has( prefix, dstore, id, uuid ) ) {
      dbgmsg( prefix + 'attempted to delete an entry (' + uuid + ') that does not exist in this partition.' );
      return false;
    }
    entries = entry_data_ref( prefix, dstore, id );
    delete entries[ uuid ];
    return ! entry_has( prefix, dstore, id, uuid );
  }

  /**
   * Returns an ECMA object with a copy of the entry's stored properties and their values.
   * @param {string} prefix  Prefix added to any log messages
   * @param {string} dstore  Data store to be used for the partitions
   * @param {string} id      partition internal name/identifier
   * @param {string} uuid    entry unique identifier.
   * @type {object}
   * @return {object} ECMA object with a copy of the entry's stored properties and their values.
   */
  function entry_read( prefix, dstore, id, uuid ) {
    var entryProperties, entrycopy;
    if ( ! partition_exists( prefix, dstore, id ) ) {
      return {};
    }
    uuid = String( uuid );
    if ( ! entry_has( prefix, dstore, id, uuid ) ) {
      dbgmsg( prefix + 'attempted to read an entry (' + uuid + ') that does not exist in this partition.' );
      return {};
    }

    entryProperties = entry_properties_ref( prefix, dstore, id, uuid );
    entrycopy = {};
    Object.keys( entryProperties ).forEach( function copyProperties( property ) {
      if ( entryProperties[ property ] instanceof Array ) {
        entrycopy[ property ] = entryProperties[ property ].slice();
      } else {
        entrycopy[ property ] = entryProperties[ property ];
      }
    });
    return entrycopy;
  }

  /**
   * Reads all entries from the local partition
   * @param {string} prefix  Prefix added to any log messages
   * @param {string} dstore  Data store to be used for the partitions
   * @param {string} id      partition internal name/identifier
   * @type {object[]}
   * @return {object[]} Array of ECMA objects with all fields/properties related to the entry.
   *   The uuid property will be a string, all other properties will be returned as is.
   */
  function entry_readAll( prefix, dstore, id ) {
    var all, entries;
    if ( ! partition_exists( prefix, dstore, id ) ) {
      return [];
    }

    all = [];
    entries = entry_data_ref( prefix, dstore, id );
    Object.keys( entries ).sort().forEach( function buildResult( uuid ) {
      var key, res, entryProperties;
      res = {};
      res.uuid = String( uuid );
      entryProperties = entry_properties_ref( prefix, dstore, id, res.uuid );

      for ( key in entryProperties ) {
        if ( entryProperties[ key ] instanceof Array ) {
          res[ key ] = entryProperties[ key ].slice();
        } else {
          res[ key ] = entryProperties[ key ];
        }
      }
      all.push( res );
    });

    return all;
  }

  // Property functions

  /**
   * Evaluate if the property exists in the provided entry.
   * @param {string} prefix  Prefix added to any log messages
   * @param {string} dstore  Data store to be used for the partitions
   * @param {string} id      partition internal name/identifier
   * @param {string} uuid     entry unique identifier.
   * @param {string} property entry's property name.
   * @type {boolean}
   * @return {boolean} true if successful, false otherwise.
   */
  function property_has( prefix, dstore, id, uuid, property ) {
    var entryProperties;
    if ( ! partition_exists( prefix, dstore, id ) ) {
      return false;
    }
    uuid = String( uuid );
    if ( ! entry_has( prefix, dstore, id, uuid ) ) {
      dbgmsg( prefix + 'Property check failed, entry "' + uuid + '" not available.' );
      return false;
    }

    entryProperties = entry_properties_ref( prefix, dstore, id, uuid );
    property = String( property );

    return entryProperties.hasOwnProperty( property );
  }

  /**
   * Add or update property to the entry with provided value. Will fail if property already exists.
   * Any value other than string, number, boolean, null or array will cause the function to abort.
   * @param {string} prefix   Prefix added to any log messages
   * @param {string} dstore   Data store to be used for the partitions
   * @param {string} id       partition internal name/identifier
   * @param {string} type     'add' or 'update'
   * @param {string} uuid     entry unique identifier.
   * @param {string} property entry's property name.
   * @param {(string|number|boolean|null|any[])} value entry's property value.
   * @type {boolean}
   * @return {boolean} true if successful, false otherwise.
   */
  function property_add_update( prefix, dstore, id, type, uuid, property, value ) {
    var entryProperties, typemsg;
    if ( ! partition_exists( prefix, dstore, id ) ) {
      return false;
    }
    if ( type === 'add' ) {
      typemsg = 'Add';
    } else if ( type === 'update' ) {
      typemsg = 'Update';
    } else {
      dbgmsg( prefix + ' Invalid "type" parameter passed.' );
      return false;
    }

    uuid = String( uuid );
    if ( ! entry_has( prefix, dstore, id, uuid ) ) {
      dbgmsg( prefix + typemsg + ' property failed, entry "' + uuid + '" not available.' );
      return false;
    }
    property = String( property );
    if ( type === 'add' && property_has( prefix, dstore, id, uuid, property ) ) {
      dbgmsg( prefix + typemsg + ' property failed, property "' + property + '" already exists in entry "' + uuid + '".' );
      return false;
    }

    if ( !( value === null || isString( value ) || isNumber( value ) ||  isBoolean( value ) || value instanceof Array ) ) {
      dbgmsg( prefix + typemsg + ' property failed, unsupported value type. Aborting.' );
      return false;
    }

    entryProperties = entry_properties_ref( prefix, dstore, id, uuid );
    if ( value instanceof Array ) {
      entryProperties[ property ] = value.slice();
    } else {
      entryProperties[ property ] = value;
    }

    return property_has( prefix, dstore, id, uuid, property );
  }

  /**
   * Removes completely an entry's property.
   * @param {string} prefix   Prefix added to any log messages
   * @param {string} dstore   Data store to be used for the partitions
   * @param {string} id       partition internal name/identifier
   * @param {string} uuid     entry unique identifier.
   * @param {string} property entry's property name.
   * @type {boolean}
   * @return {boolean} true if successful, false otherwise.
   */
  function property_remove( prefix, dstore, id, uuid, property ) {
    var entryProperties;
    if ( ! partition_exists( prefix, dstore, id ) ) {
      return false;
    }
    uuid = String( uuid );
    if ( ! entry_has( prefix, dstore, id, uuid ) ) {
      dbgmsg( prefix + ' Remove property failed, entry "' + uuid + '" not available.' );
      return false;
    }
    property = String( property );
    if ( ! property_has( prefix, dstore, id, uuid, property ) ) {
      dbgmsg( prefix + 'Remove property failed, property "' + property + '" does not exist in entry "' + uuid + '".' );
      return false;
    }

    entryProperties = entry_properties_ref( prefix, dstore, id, uuid );
    delete entryProperties[ property ];

    return ! property_has( prefix, dstore, id, uuid, property );
  }

  /**
   * Read an entry's  property value.
   * @param {string} prefix       Prefix added to any log messages
   * @param {string} dstore       Data store to be used for the partitions
   * @param {string} id           partition internal name/identifier
   * @param {string} uuid         entry unique identifier.
   * @param {string} property     entry's property name.
   * @type {*}
   * @return {*} undefined if uuid or property do not exist, property value otherwise..
   */
  function property_read( prefix, dstore, id, uuid, property ) {
    var entryProperties, res;
    if ( ! partition_exists( prefix, dstore, id ) ) {
      return void 0;
    }
    uuid = String( uuid );
    if ( ! entry_has( prefix, dstore, id, uuid ) ) {
      dbgmsg( prefix + ' Read property failed, entry "' + uuid + '" not available.' );
      return void 0;
    }
    property = String( property );
    if ( ! property_has( prefix, dstore, id, uuid, property ) ) {
      dbgmsg( prefix + 'Read property failed, property "' + property + '" does not exist in entry "' + uuid + '".' );
      return void 0;
    }

    entryProperties = entry_properties_ref( prefix, dstore, id, uuid );
    if ( entryProperties[ property ] instanceof Array ) {
      res = entryProperties[ property ].slice();
    } else {
      res = entryProperties[ property ];
    }

    return res;
  }

  /**
   * List the entry's property names.
   * @param {string} prefix Prefix added to any log messages
   * @param {string} dstore Data store to be used for the partitions
   * @param {string} id     partition internal name/identifier
   * @param {string} uuid   entry unique identifier.
   * @type {string[]}
   * @return {string[]} Array of Entry property names.
   */
  function property_list( prefix, dstore, id, uuid ) {
    var entryProperties;
    if ( ! partition_exists( prefix, dstore, id ) ) {
      return [];
    }
    uuid = String( uuid );
    if ( ! entry_has( prefix, dstore, id, uuid ) ) {
      dbgmsg( prefix + ' List properties failed, entry "' + uuid + '" not available.' );
      return [];
    }

    entryProperties = entry_properties_ref( prefix, dstore, id, uuid );

    return Object.keys( entryProperties ).sort().slice();
  }

  // Reference object function

  /**
   * Returns the partition's Entry API
   * @param {string} prefix Prefix added to any log messages
   * @param {string} dstore Data store to be used for the partitions
   * @param {string} main   Name of the main data partition that should never be destroyed
   * @param {string} type   'full' - all actions available, 'readonly' - only navigation actions available
   * @param {string} id     partition internal name/identifier
   * @type {object}
   * @return {object} Entry API object
   */
  function getPartitionReference( prefix, dstore, main, type, id ) {
    var PartitionAPI;
    id = String( id );
    if ( type !== 'full' && type !== 'readonly' ) {
      dbgmsg( prefix + ' Invalid "type" parameter passed.' );
      return null;
    }
    // 'readoly' type actions
    PartitionAPI = {
      name:id,
      listentries:listentries.bind( null, prefix, dstore, id ),
      has:entry_has.bind( null, prefix, dstore, id ),
      read:entry_read.bind( null, prefix, dstore, id ),
      readAll:entry_readAll.bind( null, prefix, dstore, id ),
      getEntryReference:getEntryReference.bind( null, prefix, dstore, id, type ),
      listproperties:property_list.bind( null, prefix, dstore, id ),
      hasproperty:property_has.bind( null, prefix, dstore, id ),
      readproperty:property_read.bind( null, prefix, dstore, id )
    };
    // Main partition cannot be destroyed
    if ( id !== main ) {
      PartitionAPI.destroy = destroy_PartitionAPI.bind( null, prefix, dstore, id, PartitionAPI, type );
    }
    // 'full' actions
    if ( type === 'full' ) {
      PartitionAPI.add = entry_add.bind( null, prefix, dstore, id );
      PartitionAPI.remove = entry_remove.bind( null, prefix, dstore, id );
      PartitionAPI.addproperty = property_add_update.bind( null, prefix, dstore, id, 'add' );
      PartitionAPI.updateproperty = property_add_update.bind( null, prefix, dstore, id, 'update' );
      PartitionAPI.removeproperty = property_remove.bind( null, prefix, dstore, id );
    }

    return PartitionAPI;
  }

  /**
   * Removes the API funciton references for a partition reference object. Also destroys the partition is type is 'full'.
   * @param {string} prefix Prefix added to any log messages
   * @param {string} dstore Data store to be used for the partitions
   * @param {string} id     partition internal name/identifier
   * @param {string} api    Reference to the current object's partition API
   * @param {string} type   'full' - delete partition as well, 'readonly' - delete only the API references
   * @type {boolean}
   * @return {boolean} true if the partition has been destroyed, false otherwise.
   */
  function destroy_PartitionAPI( prefix, dstore, id, api, type ) {
    // Delete storage partition
    if ( partition_exists( prefix, dstore, id ) && type !== 'readonly' ) {
      delete dstore[ id ];
    }
    // Clears local PartitionAPI instance
    Object.keys( api ).forEach( function clearAPI( key ) {
      delete api[ key ];
    });
    return ! partition_exists( prefix, dstore, id );
  }

  /**
   * Returns an ECMA object with the Entry API for the provided entry name.
   * @param {string} prefix Prefix added to any log messages
   * @param {string} dstore Data store to be used for the partitions
   * @param {string} id     partition internal name/identifier
   * @param {string} type   'full' - all actions available, 'readonly' - only navigation actions available
   * @param {string} uuid   entry unique identifier
   * @type {object}
   * @return {object} ECMA object whose methods will modify the selected entry.
   */
  function getEntryReference( prefix, dstore, id, type, uuid ) {
    var EntryAPI;
    if ( ! partition_exists( prefix, dstore, id ) ) {
      return null;
    }
    if ( type !== 'full' && type !== 'readonly' ) {
      dbgmsg( prefix + ' Invalid "type" parameter passed.' );
      return null;
    }
    uuid = String( uuid );
    if ( ! entry_has( prefix, dstore, id, uuid ) ) {
      dbgmsg( prefix + 'Attempt to create reference for an entry (' + uuid + ') not present on the partition.' );
      return null;
    }
    // 'readoly' type actions
    EntryAPI = {
      name:uuid,
      listproperties:property_list.bind( null, prefix, dstore, id, uuid ),
      has:entry_has.bind( null, prefix, dstore, id, uuid ),
      read:property_read.bind( null, prefix, dstore, id, uuid ),
      destroy:destroy_EntryAPI.bind( null, prefix, dstore, id, uuid, EntryAPI, type )
    };
    // 'full' actions
    if ( type === 'full' ) {
      EntryAPI.add = property_add_update.bind( null, prefix, dstore, id, 'add', uuid );
      EntryAPI.update = property_add_update.bind( null, prefix, dstore, id, 'update', uuid );
      EntryAPI.remove = property_remove.bind( null, prefix, dstore, id, uuid );
    }
    return EntryAPI;
  }

  /**
   * Removes the API funciton references for a partition reference object. Also destroys the partition is type is 'full'.
   * @param {string} prefix Prefix added to any log messages
   * @param {string} dstore Data store to be used for the partitions
   * @param {string} id     partition internal name/identifier
   * @param {string} uuid   entry unique identifier.
   * @param {string} api    Reference to the current object's partition API
   * @param {string} type   'full' - delete partition as well, 'readonly' - delete only the API references
   * @type {boolean}
   * @return {boolean} true if the partition has been destroyed, false otherwise.
   */
  function destroy_EntryAPI( prefix, dstore, id, uuid, api, type ) {
    var entries;
    // Delete Entry
    if ( entry_has( prefix, dstore, id, uuid ) && type !== 'readonly' ) {
      entries = entry_data_ref( prefix, dstore, id );
      delete entries[ uuid ];
    }
    // Clears local PartitionAPI instance
    Object.keys( api ).forEach( function clearAPI( key ) {
      delete api[ key ];
    });
    return ! entry_has( prefix, dstore, id, uuid );
  }
})();