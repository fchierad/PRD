/**
 * Simple module to assist on workflow development.
 * Created to be imported in Overview > Global Scripts and used on both forms and engine.
 * @namespace PRD
 * @version 1.0.3
 * @license MIT License
 */
var PRD = (function IIFE( logprefix ) {
  // Exported public API. Functions and variables not declared here will remain private to this module
  var PublicAPI = {
    util: {
      formOrEngine:formOrEngine,
      logerror:logerror,
      coerceToString:coerceToString,
      JSONobj: {
        JSONparse:parse,
        JSONstringify:stringify,
        JSONget:get,
        JSONtest:test
      }
    },
    setlogprefix:setlogprefix,
    version:version,
    IDVget:IDVget,
    IDVglobalQuery:IDVglobalQuery
  };

  /**
   * Return module version.
   *
   * @memberof PRD
   * @since 1.0.1
   *
   * @type {string}
   * @return {string} Module's version in the format M.m.p (Major, minor, patch)
   */
  function version() {
    return '1.0.3';
  }

  /**
   * @namespace PRD.util
   * @memberof PRD
   */

    /**
   * Proxy for the actual JSON object used in browsers (JSON) or workflow engine (ScriptVault.JSON).
   * Wraps the parse() and stringify() calls in try/catch blocks to report errors via logerror() instead of
   * letting the workflow engine break its regular flow when an error occurs.
   * @namespace PRD.util.JSONobj
   * @memberof PRD.util
   * @since 1.0.2
   */

  /**
   * Storage for the framework objects, only used when functions are called from inside a form.
   * Not needed when code is running on the workflow engine.
   */
  var IDMAPPS = {
    field:null,
    form:null,
    IDVault:null
  };

  /**
   * Internal state, used to define what functions to export as well as
   * the behavior for functions that can be used in both form and engine.
   */
  var where = formOrEngine();
  var JString; // Java string, used only on the workflow engine.
  if ( where === 'engine' ) {
    JString = java.lang.String;
  }
  var prefix; // prefix variable used by the logerror() calls.
  // Initializes the prefix variable used by the logerror() calls.
  setlogprefix( logprefix );

  /**
   * Wrapper for the parse() call on the host environment's JSON object.
   * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
   *
   * @function parse
   * @memberof PRD.util.JSONobj
   * @since 1.0.2
   *
   * @param {string}     s          String with valid JSON syntax
   * @param {function=}  [reviver] (Optional) If a function, this prescribes how the value originally produced by parsing is transformed, before being returned.
   *
   * @type {object}
   * @return {object} ECMA Object generated from the JSON string. On error return empty object and report the error via logerror()
   */
  function JSONparse( s, r ) {
    var res, pointer;
    // Setup a pointer to the JSON object since its name differs on forms and engine.
    if ( where === 'engine' ) {
      pointer = ScriptVault.JSON;
    }
    if ( where === 'form' ) {
      pointer = JSON;
    }
    try {
      res = pointer.parse( s, r );
    } catch( e ){
      logerror( 'Error during JSON parse(): ' + e.message );
    }
    if (! res ) {
      return {};
    }
    return res;
  }

  /**
   * Wrapper for the stringify() call on the host environment's JSON object.
   * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
   *
   * @function stringify
   * @memberof PRD.util.JSONobj
   * @since 1.0.2
   *
   * @param {object}                        o           ECMA object to convert to JSON
   * @param {(function|string[]|number[])=} [replacer]  (Optional) A function that alters the behavior of the stringification process, or an array of String and Number objects that serve as a whitelist for selecting/filtering the properties of the value object to be included in the JSON string. If this value is null or not provided, all properties of the object are included in the resulting JSON string
   * @param {(string|number)=}              [space]     (Optional) A String or Number object that's used to insert white space into the output JSON string for readability purposes. If this is a Number, it indicates the number of space characters to use as white space; this number is capped at 10 (if it is greater, the value is just 10). Values less than 1 indicate that no space should be used. If this is a String, the string (or the first 10 characters of the string, if it's longer than that) is used as white space. If this parameter is not provided (or is null), no white space is used.
   *
   * @type {string}
   * @return {string} Serialized ECMA object in JSON format. On error return empty string and report the error via logerror()
   */
  function JSONstringify( o, r, s ) {
    var res, pointer;
    // Setup a pointer to the JSON object since its name differs on forms and engine.
    if ( where === 'engine' ) {
      pointer = ScriptVault.JSON;
    }
    if ( where === 'form' ) {
      pointer = JSON;
    }
    try {
      res = pointer.stringify( o, r, s );
    } catch( e ){
      logerror( 'Error during JSON stringify(): ' + e.message );
    }
    if (! res ) {
      return '';
    }
    return res;
  }

  /**
 * Verify if an ECMA object has the selected location.
 * Note: To reference properties with a dot in their name use the format ["property.name"] .
 *
 * Ported from IDM engine to RBPM. IDM Engine version at https://github.com/fchierad/IDM-ECMAlib/blob/v1.0.2/JSONlib-JS.js
 *
 * @function test
 * @memberof PRD.util.JSONobj
 * @since 1.0.3
 *
 * @param {(object|string)}  inputJSON    Input JSON (ECMA object). If a string-serialized JSON is provided it will be converted to a JSON object internally
 * @param {string}           whattotest   Dot-separated list of properties as if you are accessing them via ECMAscript
 *
 * @return {boolean} true if the path is found, false otherwise
 */
function JSONtest( inputJSON, whattotest ) {
  var fname, i, itval, itobj, JSONobj, getArr, propName;
  fname = 'JSONtest(): ';
  // Review input data
  if ( typeof inputJSON === 'string' ) {
    JSONobj = JSONparse( inputJSON );
  } else {
    JSONobj = inputJSON;
  }
  if ( typeof whattotest === 'string' ) {
    getArr = charArrToPropertyNames( stringToCharArray( whattotest ) );
  } else {
    return false;
  }
  // Iterates through the object using itobj and itval as the middle steps to find the desired result
  itobj = JSONobj;
  for( i = 0; i < getArr.length; i++ ) {
    propName = getArr[ i ];
    if ( typeof itobj === 'object' && propName in itobj ) {
      itval = itobj[ propName ];
    } else {
      return false;
    }
    itobj = itval;
  }
  return true;
}

/**
 * Retrieves a property of an ECMA object (or its subordinate object) and returns it in the specified type.
 * Note: To reference properties with a dot in their name use the format ["property.name"] .
 *
 * Ported from IDM engine to RBPM. IDM Engine version at https://github.com/fchierad/IDM-ECMAlib/blob/v1.0.2/JSONlib-JS.js
 *
 * @function get
 * @memberof PRD.util.JSONobj
 * @since 1.0.3
 *
 * @param {(object|string)}  inputJSON     Input JSON (ECMA object). If a string-serialized JSON is provided it will be converted to a JSON object internally
 * @param {string}           whattoget     Dot-separated list of properties as if you are accessing them via ECMAscript
 * @param {string=}          [returntype]  (Optional) Desired return type. Valid values are: string, number, raw. Defaults to raw in case whatever is provided is not one of the 3 valid options
 *
 * @return {(string|number|boolean|object)} Selected property's value in the selected format. If parsing of the object fails returns an empty string
 */
function JSONget( inputJSON, whattoget, returntype ) {
  var fname, i, itval, itobj, JSONobj, getArr, propName, res = '';
  fname = 'JSONget(): ';
  // Review input data
  if ( typeof inputJSON === 'string' ) {
    JSONobj = JSONparse( inputJSON );
  } else {
    JSONobj = inputJSON;
  }
  if ( typeof whattoget === 'string' ) {
    getArr = charArrToPropertyNames( stringToCharArray( whattoget ) );
  } else {
    return res;
  }
  if ( returntype !== 'string' && returntype !== 'number' && returntype !== 'raw' ) {
      returntype = 'raw';
  }
  // Iterates through the object using itobj and itval as the middle steps to find the desired result
  itobj = JSONobj;
  for( i = 0; i < getArr.length; i++ ) {
    propName = getArr[ i ];
    if ( typeof itobj === 'object' && propName in itobj ) {
      itval = itobj[ propName ];
    } else {
      return res;
    }
    itobj = itval;
  }
  // Inspect returned data and coerce it as needed. No default set since res is set at the start of the function
  switch ( returntype ) {
    case 'string':
      res = String( itval );
      break;
    case 'number':
      res = parseInt( String( itval ), 10 );
      break;
    case 'raw':
      res = itval;
      break;
  }
  return res;
}

//  https://github.com/fchierad/IDM-ECMAlib/blob/v1.0.2/JSONlib-JS.md#JSONget

  /**
   * Unicode-safe split of a string to a character Array.
   *
   * Since IDM 4.5/IDM 4.6 does not have access to ES6 - therefore no spread ... operator - this function is needed.
   * Once IDM supports the spread operator use that instead.
   *
   * Ported from IDM engine to RBPM. IDM Engine version at https://github.com/fchierad/IDM-ECMAlib/blob/v1.0.2/JSONlib-JS.js
   *
   * @since 1.0.3
   * @private
   * @param {string}  str   String input. Any other input will be coerced to string using String() and probably won't behave as expected
   * @type {string[]}
   * @return {string[]} Unicode-safe character array
   */
  function stringToCharArray( str ) {
    var cArr = [], fname;
    fname = 'stringToCharArray(): ';
    try {
      cArr = String( str ).split( /(?=(?:[\0-\t\x0B\f\x0E-\u2027\u202A-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]))/ );
    } catch( e ) {
      logerror( fname + 'Failed to split the input string, error: ' + e.message );
    }
    return cArr;
  }

  /**
   * JSON path parser. Iterates through a character array and returns an array with property names.
   * Array indexes are purely numeric property names and will be returned as numbers, not strings.
   * Character Array should have been split from the original ECMA object path that we want to parse.
   *
   * Ported from IDM engine to RBPM. IDM Engine version at https://github.com/fchierad/IDM-ECMAlib/blob/v1.0.2/JSONlib-JS.js
   *
   * @since 1.0.0
   * @private
   * @param {string[]}  str   Character string. Assumes each entry in the array is a single Unicode character
   * @type {Array<(string|number)>}
   * @return {Array<(string|number)>} property names array
   */
  function charArrToPropertyNames( cArr ) {
    var i, fname, currentName, squaremark, re_whitespace, re_number, re_quotes, property = [];
    fname = 'charArrToPropertyNames(): ';
    if ( !( cArr instanceof Array ) ) {
      logerror( fname + 'Input parameter is not an Array, aborting.' );
      return property;
    }
    // Setup for parsing. Delimiter for property names are either dot or open and close square brackets
    // If the contents inside square brackets are purely numeric then a number is returned
    currentName = '';
    re_number = /^\d+$/;
    re_quotes = /^(['"])(.+)\1$/;
    squaremark = ( cArr[ 0 ] === '[' )? 'first':'end'; //squaremark can be 'first', 'start', 'end'
    // Iterates through the character array parsing elements into their own property array entry
    for( i=0; i < cArr.length; i++ ) {
      if ( squaremark === 'first' && cArr[ i ] === '[' ) {
        squaremark = 'start';
        continue;
      }
      if ( squaremark === 'end' && cArr[ i ] === '[' ) {
        squaremark = 'start';
        if ( currentName.trim() !== '' ) { // prevent double push on constructs like arr[0][0]
          property.push( currentName.trim() );
        }
        currentName = '';
        continue;
      }
      if ( squaremark === 'start' && cArr[ i ] === ']' ) {
        squaremark = 'end';
        currentName = currentName.trim();
        // If the property name between [] is a pure number, coerces the string to a number
        if ( re_number.test( currentName ) ) {
          currentName = parseInt( currentName, 10 );
        }
        // Remove quotes around property name if they are present like obj["property name"], returning property name
        if ( re_quotes.test( currentName ) ) {
          currentName = re_quotes.exec( currentName )[2];
        }
        property.push( currentName );
        currentName = '';
        continue;
      }
      // Traditional . delimiter
      if ( squaremark === 'end' && cArr[ i ] === '.' ) {
        if ( currentName.trim() !== '' ) { // prevent double push on constructs like arr[0].name
          property.push( currentName.trim() );
        }
        currentName = '';
        continue;
      }
      currentName += cArr[ i ];
    }
    if ( currentName !== '' ) {
      property.push( currentName.trim() );
    }
    return property;
  }

  /**
   * Set prefix for the log activities generated by logerror() on both engine and form.
   * Given that forms instantiate the module on load, setting the value inside a form would affect only said form.
   * Given that the workflow engine can pause processing at points and remove the thread from memory, reading the same
   * again later, calling this function anywhere outside the Overview > Global Scripts might cause the value set to be lost
   * after such pauses. One example of such pauses/behavior is when a workflow reaches an approval activity.
   *
   * @memberof PRD
   * @since 1.0.2
   *
   * @param {string} str  String that will be appended to any logerror() call.
   */
  function setlogprefix( str ) {
    prefix = coerceToString( str, '' );
  }

  /**
   * Try to detect if we are in a web browser or in the User App/RBPM/IDMAPPs workflow engine.
   *
   * @memberof PRD.util
   * @since 1.0.0
   *
   * @type {string}
   * @return {string} 'form' if in a Browser, 'engine' if on the workflow engine. 'detection failed' otherwise.
   */
  function formOrEngine() {
    var res = 'Detection failed';
    if ( typeof window === 'object' &&
      'document' in window &&
      typeof java === 'undefined'
    ) {
      res = 'form';
    }
    if ( typeof java === 'object' &&
          'lang' in java &&
          'String' in java.lang &&
      typeof window === 'undefined'
    ) {
      res = 'engine';
    }
    return res;
  }

  /**
   * Output error message based on where the code is running.
   * Output to the console.log() if in a browser, to catalina.out if in the workflow engine.
   * Prepends the value of the module's internal 'prefix' variable.
   *
   * @memberof PRD.util
   * @since 1.0.0
   *
   * @param  {string} msg    Error message to be logged.
   *
   * @type {boolean}
   * @return {boolean} true if the message was returned successfully, false otherwise.
   */
  function logerror( msg ) {
    var requestID, prepend;
    // Coercing log message via String() to avoid null and undefined results being passed to the log mechanism.
    msg = String( msg );
    // Coercing log prefix internal variable via String() to avoid null and undefined results being passed to the log mechanism.
    prepend = String( prefix );
    // Using try/catch makes the call safer, it also impacts performance.
    if ( where === 'engine' ) {
      // process.getRequestId() may fail if called during Global Script initialization.
      try {
        requestID = process.getRequestId();
        requestID += ': ';
      } catch(e) {}
    }
    try {
      if ( where === 'form' ) {
        console.log( prepend + msg );
      }
      if ( where === 'engine' ) {
        java.lang.System.out.println( prepend + requestID + msg );
      }
    } catch ( e ) {
      // discarding error, since this is an error about printing the error message...
      return false;
    }
    return true;
  }

  /**
   * (Form only) Initializes references to the IDMAPPs framework objects and save the same in the internal storage.
   * Returns nothing.
   *
   * @function init
   * @memberof PRD
   * @since 1.0.0
   *
   * @param {object}  field    IDMAPPS framework field object
   * @param {object}  form     IDMAPPS framework form object
   * @param {object}  IDVault  IDMAPPS framework IDVault object
   */
  function formInit( field, form, IDVault ) {
    // Only appends the parameters passed so that we can check for the link's existence
    // before using it in the functions that require the User App/RBPM/IDMAPPS framework
    if ( field != null ) {
      IDMAPPS.field = field;
    }
    if ( form != null ) {
      IDMAPPS.form = form;
    }
    if ( IDVault != null ) {
      IDMAPPS.IDVault = IDVault;
    }
  }

  /**
   * Coerces the result to an ECMA string.
   * Coercion rules for this function:
   * If the first input parameter is null or undefined returns default value.
   * If the first input parameter is an Array it returns the array joined by ' '.
   * If the first input parameter is a String, Number or Boolean it returns a string.
   * If the first input parameter is an object other than an Array it returns the default value.
   * If the second input value is not null then the default value becomes the second input value.
   *
   * @memberof PRD.util
   * @since 1.0.0
   *
   * @param  {any}     input     Input parameter to be coerced.
   * @param  {string}  [defVal]  Default value to be used
   *
   * @type {string}
   * @return {string} resulting string.
   */
  function coerceToString( input, defVal ) {
    var ret = '';
    /* Throughout this function String() is used to guarantee that the string generated
     * is an ECMA string. This is only a concern on the workflow engine since the engine
     * allows a mix of ECMA and Java code. Returning a Java string will cause the
     * toJSON() function to fail when using JSON.stringify(), hence this safety.
     */
    if ( defVal != null && typeof defVal === 'string' ) {
      ret = String( defVal );
    }
    if ( input === null || input === undefined ) {
      return ret;
    }
    if ( typeof input === 'string' || typeof input === 'number' || typeof input === 'boolean' ) {
      ret = String( input );
    }
    if ( input instanceof Array ) {
      ret = String( input.join( ' ' ) );
    }
    return ret;
  }

  /**
   * (Engine only) Returns basic HTTP auth header. Format is: Basic B64encodedUSERNAME:PASSWORD
   *
   * @memberof PRD.util
   * @since 1.0.3
   *
   * @param {string}  username  HTTP auth user's name.
   * @param {string}  password  HTTP auth user's password.
   *
   * @type {string}
   * @return {string} HTTP Basic 'Authorization' header's value.
   */
  function basicHTTPauthHeader( username, password ) {
    var res = 'Basic ', conc, JString, Base64, b64str;
    try {
      JString = java.lang.String;
      Base64 = new Packages.org.apache.commons.codec.binary.Base64();
      conc = JString( String( username ) + ':' + String( password ) ).getBytes( 'UTF-8' );
      b64str = String( JString( Base64.encodeBase64( conc ), 'UTF-8' ) );
      res += b64str;
    } catch( e ) {
      logerror( 'basicAuthHeader(): Failed to build Basic Authentication HTTP header value. Error: ' + e.message );
    }
    return res;
  }

  /**
   * (Engine only) Function to coerce provided flowdata and return if we are past max retries or not.
   *
   * @memberof PRD.util
   * @since 1.0.3
   *
   * @param {string}  curcounter  Current Counter
   * @param {string}  maxretries  Maximum retries value
   *
   * @type {boolean}
   * @return {boolean} true if maxretries is greater than current counter, false otherwise.
   */
  function shouldRetry( curcounter, maxretries ) {
    var retry = false;
    curcounter = String( curcounter ) | 0;
    maxretries = String( maxretries ) | 0;
    retry = ( curcounter < maxretries ) ? true : false;
    return retry;
  }

  /**
   * (Engine only) Compares 2 unidimensional ECMA Arrays or Java Vectors and an Array of arrays with comparison results.
   *
   * @memberof PRD.util
   * @since 1.0.2
   *
   * @param  {(string[]|java.util.Vector)} list1         ECMA Array or Java Vector.
   * @param  {(string[]|java.util.Vector)} list2         ECMA Array or Java Vector.
   * @param  {boolean}                     ignorecase   Changes string comparison to case insensitive.
   *
   * @type {Array.<string[]>}
   * @return {Array.<string[]>} ECMA Array with 3 parts. [ [ elements only present on list1 ], [ elements only present on list2 ], [ elements present on both] ]
   */
  function Compare( list1, list2 , ignorecase ) {
    var exists1 = {}, exists2 = {}, onlyin1 = [], onlyin2 = [], isinboth = [], res,
    i, curr, compare, fname, dedup1 = [];
    fname = 'Unique(): ';
    if ( list1 != null && typeof list1 === 'object' && list2 != null && typeof list2 === 'object' ) {
      // Convert Vector to Array so we can perform the comparisons.
      if ( 'getClass' in list1 && list1.getClass() == 'class java.util.Vector' ) {
        list1 = JavaVectorToECMAArray( list1 );
      }
      if ( 'getClass' in list2 && list2.getClass() == 'class java.util.Vector' ) {
        list2 = JavaVectorToECMAArray( list2 );
      }
      // Deduplicate lists, then compare them
      if ( list1 instanceof Array && list2 instanceof Array ) {
        // generate hashmap for list1
        for( i = 0; i < list1.length; i++ ) {
          // Using compare for case sensitive and insentive comparisson while keeping curr as the current value coerced to string
          curr = String( list1[ i ] );
          if ( ignorecase === true ) {
            compare = curr.toLowerCase();
          } else {
            compare = curr;
          }
          if ( ! exists1.hasOwnProperty( compare ) ) {
            dedup1.push( curr );
            exists1[ compare ] = true; // marking the entry as already existing for deduplication purposes
          }
        }
        // Build onlyin2 and isinboth by iterating on list2, generating its hashmap while comparing with list1
        for( i = 0; i < list2.length; i++ ) {
          // Using compare for case sensitive and insentive comparisson while keeping curr as the current value coerced to string
          curr = String( list2[ i ] );
          if ( ignorecase === true ) {
            compare = curr.toLowerCase();
          } else {
            compare = curr;
          }
          if ( ! exists2.hasOwnProperty( compare ) ) {
            exists2[ compare ] = true; // marking the entry as already existing for deduplication purposes
            if ( exists1.hasOwnProperty( compare ) ) {
              isinboth.push( curr );
            } else {
              onlyin2.push( curr );
            }
          }
        }
        // Iterate deduplicated list1 against list2's hashmap to populate onlyin2
        for( i = 0; i < dedup1.length; i++ ){
          // Using compare for case sensitive and insentive comparisson while keeping curr as the current value coerced to string
          curr = String( dedup1[ i ] );
          if ( ignorecase === true ) {
            compare = curr.toLowerCase();
          } else {
            compare = curr;
          }
          if ( ! exists2.hasOwnProperty( compare ) ) {
            onlyin1.push( curr );
          }
        }
        // Convert results back to Vector if the obj passed in was a java.util.Vector
      }
    }
    res = [ onlyin1, onlyin2, isinboth ];
    return res;
  }

  /**
   * (Engine only) Parses an unidimensional ECMA Array or Java Vector and returns the same type of object with only unique entries.
   *
   * @memberof PRD.util
   * @since 1.0.2
   *
   * @param  {(string[]|java.util.Vector)} obj          ECMA Array or Java Vector.
   * @param  {boolean}                     ignorecase   Changes string comparison to case insensitive.
   *                                                    This means the casing of the results will match the casing of their
   *                                                    first time appearing in the list provided.
   *
   * @type {(string[]|java.util.Vector)}
   * @return {(string[]|java.util.Vector)} ECMA Array or Java Vector. If obj is not a valid type returns empty ECMA Array.
   */
  function Unique( obj , ignorecase ) {
    var exists = {}, res = [], convertToVector, i, curr, compare, fname;
    fname = 'Unique(): ';
    if ( obj != null && typeof obj === 'object' ) {
      // Convert Vector to Array so we can deduplicate both using the same code
      if ( 'getClass' in obj && obj.getClass() == 'class java.util.Vector' ) {
        obj = JavaVectorToECMAArray( obj );
        convertToVector = true;
      } else {
        convertToVector = false;
      }
      // Deduplicate array, generate
      if ( obj instanceof Array ) {
        for( i = 0; i < obj.length; i++ ) {
          // Using compare for case sensitive and insentive comparisson while keeping curr as the current value coerced to string
          curr = String( obj[ i ] );
          if ( ignorecase === true ) {
            compare = curr.toLowerCase();
          } else {
            compare = curr;
          }
          if ( ! exists.hasOwnProperty( compare ) ) {
            res.push( curr );
            exists[ compare ] = true; // marking the entry as already existing for deduplication purposes
          }
        }
        // Convert results back to Vector if the obj passed in was a java.util.Vector
        if ( convertToVector ) {
          res = ECMAArrayToJavaVector( res );
        }
      }
    }
    return res;
  }

  /**
   * (Engine only) Parses the result from flowdata.getObject into an Array of strings and ECMA objects.
   * Each DOM element node will be an object's property name, and each property will contain
   * an array of items. Those items cam be strings or other objects.
   * @memberof PRD.util
   * @since 1.0.2
   *
   * @param  {java.util.ArrayList}  list  Java object resulting from flowdata.getObject()
   *
   * @type {(array.<(object|string)>|null)}
   * @return {(array.<(object|string)>|null)} ECMA Array of objects and string. If error occur returns null.
   */
  function getObject2arr( list ) {
    var res = null, fname, initialnode, currnode, nodename, childnodes;
    fname = 'getObject2arr(): ';
    if ( list === null || (!( typeof list === 'object' && list.getClass() == 'class java.util.ArrayList' )) ) {
      logerror( fname + 'Invalid parameter received. list must be the result of a flowdata.getObject() call.' );
      return res;
    }
    if ( list.size() > 0 ) {
      // Retrieves the first ElementNSImpl node from the list
      initialnode = list.get(0);
    }
    if ( initialnode != null && typeof initialnode === 'object' && initialnode.getClass() == 'class org.apache.xerces.dom.ElementNSImpl' ) {
      currnode = initialnode;
      res = [ {} ];
      while ( currnode ) {
        if ( currnode.getNodeType() == getNodeTypes.nodetype.Element ) {
          nodename = String( currnode.getNodeName() );
          if ( ! res[ 0 ].hasOwnProperty( nodename ) ) {
            res[ 0 ][ nodename ] = [];
          }

          if ( currnode.hasChildNodes() ) {
            childnodes = currnode.getChildNodes();
            for ( i = 0; i < childnodes.getLength(); i++ ) {
              if ( shouldProcessNode( childnodes.item( i ) ) ) {
                res[ 0 ][ nodename ].push( flowdata2obj( childnodes.item( i ) ) );
              }
            }
          }

        }
        if ( currnode.getNodeType() == getNodeTypes.nodetype.Text ) {
          if ( shouldProcessNode( currnode ) ) {
            logerror( fname + 'found text node: "' + currnode.getNodeValue().charCodeAt(0) + '"' + currnode.getNodeValue().length );
            res.push( String( currnode.getNodeValue() ) );
          }
        }
        currnode = currnode.getNextSibling();
      }
    }
    return res;
  }

  /**
   * (Engine only) Check if we should skip processing a text node.
   * Using xerces libraries to parseflowdata sibling/child nodes yields several text nodes with \ (charCodeAt(0) of 10)
   * that do not appear when looking at flowdata xml in the metaxml field of the afdocument table.
   * Given that behavior we need to strip those text nodes out of our results.
   * @since 1.0.2
   * @private
   * @param  {(org.apache.xerces.dom.ElementNSImpl|org.apache.xerces.dom.TextImpl)}  node     Java xerces node
   * @type {boolean}
   * @return {boolean} true if we should process the node, false otherwise.
   */
  function shouldProcessNode( node ) {
    if ( node === null ) {
      return false;
    }
    if ( typeof node === 'object' && node.getNodeType() == getNodeTypes.nodetype.Element ) {
      return true;
    }
    if ( typeof node === 'object' && node.getNodeType() == getNodeTypes.nodetype.Text ) {
      if ( node.getNodeValue().length === 1 && node.getNodeValue().charCodeAt( 0 ) === 10 ) {
        return false;
      } else {
        return true;
      }
    }
    return false;
  }

  /**
   * (Engine only) Iterates recursively through DOM nodes from flowdata
   * @since 1.0.2
   * @private
   * @param  {(org.apache.xerces.dom.ElementNSImpl|org.apache.xerces.dom.TextImpl)}  node     Java xerces node
   * @type {(string|object)}
   * @return {(string|object)} String or ECMA objects.
   */
  function flowdata2obj( node ) {
    var fname, i, nodename, childnodes, iterate = {};
    fname = 'flowdata2obj(): ';
    if ( node === null) {
      return '';
    }
    if ( node.getNodeType() == getNodeTypes.nodetype.Text ) {
      return String( node.getNodeValue() );
    }
    if ( node.getNodeType() == getNodeTypes.nodetype.Element ) {
      nodename = String( node.getNodeName() );
      // Child node processing
      if ( node.hasChildNodes() ) {
        iterate[ nodename ] = [];
        childnodes = node.getChildNodes();
        for ( i = 0; i < childnodes.getLength(); i++ ) {
          if ( shouldProcessNode( childnodes.item( i ) ) ) {
            iterate[ nodename ].push( flowdata2obj( childnodes.item( i ) ) );
          }
        }
      } else {
        // In flowdata any element node with no child nodes has received an empty string
        iterate[ nodename ] = [ '' ];
      }
      return iterate;
    }
    return '';
  }

  /**
   * (Engine only) Returns an object to be used to check what node type was returned from node.getNodeType().
   * @since 1.0.2
   * @private
   * @type {object}
   * @return {object} ECMA Object whose properties and their values map to the possible results of node.getNodeType().
   */
  if ( where === 'engine' ) {
    // Attaching to the function on load time so that it only runs once.
    getNodeTypes.nodetype = getNodeTypes();
  }
  function getNodeTypes() {
    var nodetype = {};
    nodetype.Attr = Packages.org.w3c.dom.Node.ATTRIBUTE_NODE;
    nodetype.CDATASection = Packages.org.w3c.dom.Node.CDATA_SECTION_NODE;
    nodetype.Comment = Packages.org.w3c.dom.Node.COMMENT_NODE;
    nodetype.DocumentFragment = Packages.org.w3c.dom.Node.DOCUMENT_FRAGMENT_NODE;
    nodetype.Document = Packages.org.w3c.dom.Node.DOCUMENT_NODE;
    nodetype.DocumentType = Packages.org.w3c.dom.Node.DOCUMENT_TYPE_NODE;
    nodetype.Element = Packages.org.w3c.dom.Node.ELEMENT_NODE;
    nodetype.Entity = Packages.org.w3c.dom.Node.ENTITY_NODE;
    nodetype.EntityReference = Packages.org.w3c.dom.Node.ENTITY_REFERENCE_NODE;
    nodetype.Notation = Packages.org.w3c.dom.Node.NOTATION_NODE;
    nodetype.ProcessingInstruction = Packages.org.w3c.dom.Node.PROCESSING_INSTRUCTION_NODE;
    nodetype.Text = Packages.org.w3c.dom.Node.TEXT_NODE;
    return nodetype;
  }

  /**
   * (Engine only) Converts a unidimensional Java Vector whose entries are strings to an ECMA Array.
   * https://docs.oracle.com/javase/8/docs/api/java/util/Vector.html
   *
   * @param  {java.util.Vector} v   Java Vector.
   *
   * @memberof PRD.util
   * @since 1.0.0
   *
   * @type {string[]}
   * @return {string[]} ECMA array.
   */
  function JavaVectorToECMAArray( v ) {
    var it, res = [], fname;
    fname = 'JavaVectorToECMAArray(): ';
    if ( where !== 'engine' ) {
      logerror( fname + 'can only be used in the workflow engine.' );
      return;
    }
    if ( v != null && typeof v === 'object' && v.size() > 0 ) {
      try {
        it = v.iterator();
        while( it.hasNext() ) {
          res.push( String( it.next() ) );
        }
      } catch( e ) {
        logerror( fname + 'Error converting Vector into Array: ' + e.message );
      }
    }
    return res;
  }

  /**
   * (Engine only) Converts a unidimensional ECMA array whose entries are strings to a Java Vector.
   * https://docs.oracle.com/javase/8/docs/api/java/util/Vector.html
   *
   * @memberof PRD.util
   * @since 1.0.0
   *
   * @param  {string[]} arr   ECMA array.
   *
   * @type {java.util.Vector}
   * @return {java.util.Vector} Java Vector.
   */
  function ECMAArrayToJavaVector( arr ) {
    var i, res, fname;
    fname = 'ECMAArrayToJavaVector(): ';
    if ( where !== 'engine' ) {
      logerror( fname + 'can only be used in the workflow engine.' );
      return;
    }
    try {
      res = new java.util.Vector();
      for ( i = 0; i < arr.length; i++ ) {
        res.add( JString( arr[ i ] ) );
      }
      return res;
    } catch( e ) {
      logerror( fname + 'Error converting Array into Vector: ' + e.message );
    }
  }

  /**
   * Performs an IDVault.get and returns an ECMA array with the result.
   *
   * @memberof PRD
   * @since 1.0.0
   *
   * @param  {string} ldapdn    LDAP Fully Distinguised name of the eDirectory object to be queried.
   * @param  {string} entkey    DAL entity key.
   * @param  {string} attrkey   DAL attribute key. Attrribute must be configured under the DAL entity.
   * @param  {object} [IDVobj]  (form mode only) Dependency injection for framework 'IDVault' object. Not needed if in engine mode. Not needed if in form mode and the module has been initialized with PRD.init()
   *
   * @type {string[]}
   * @return {string[]} ECMA array with the results. Empty if IDVault.get returned null, array with one or more elements otherwise.
   */
  function IDVget( ldapdn, entkey, attrkey, IDVobj ) {
    // Variable declaration. Keep all the declarations together.
    var qres = [];
    var gattr, gattrV, errmsg, fname;
    fname = 'IDVget(): ';
    // Adjusting function input values based on where it is being executed.
    if ( where === 'engine' ) {
      IDVobj = IDVault;
    }
    if ( where === 'form' && IDVobj == null && IDMAPPS.IDVault !== null ) {
      IDVobj = IDMAPPS.IDVault;
    }
    // Check input parameters.
    if ( ldapdn == null || entkey == null || attrkey == null || IDVobj == null ) {
      errmsg = [];
      errmsg.push( fname + 'missing mandatory parameters.' );
      errmsg.push( 'ldapdn: ' + String( ldapdn ) + ',' );
      errmsg.push( 'entkey: ' + String( entkey ) + ',' );
      errmsg.push( 'attrkey: ' + String( attrkey ) + ',' );
      errmsg.push( 'IDVobj: ' + String( IDVobj ) + '.' );
      logerror( errmsg.join( ' ' ) );
      return qres;
    }
    // Performs the query and handles errors
    try
    {
      // Function call parameters are different between engine and form
      if ( where === 'form' ) {
        gattr = IDVobj.get( null, ldapdn, entkey, attrkey );
      }
      if ( where === 'engine' ) {
        gattr = IDVobj.get( ldapdn, entkey, attrkey );
      }
      // Normalize results into an ECMA array
      if ( gattr === null ) {
        // Query succeeded with 0 results. Stub left in case we need to add debug messages.
      } else if ( typeof gattr === 'string' ) {
        // Query succeeded with a single result. Casts result as a single-element array to the qres variable.
        qres.push( coerceToString( gattr ) );
      } else if ( where === 'form' && gattr instanceof Array ) {
        // Query succeeded with 2 or more results. Saves results directly to the qres variable.
        qres = gattr;
      } else if ( where === 'engine' && typeof gattr === 'object' && gattr.size() > 0 ) {
        // Query succeeded with 2 or more results. Saves results directly to the qres variable.
        qres = JavaVectorToECMAArray( gattr );
      }
    } catch( e ) {
      logerror( fname + 'Error occured during IDVault.get query. Aborting. Error message: ' + e.message );
    }
    // Force the result to return a copy of the array.
    return qres;
  }

  /**
   * Performs an IDVault.globalQuery and returns an object with the result.
   *
   * @memberof PRD
   * @since 1.0.1
   *
   * @param  {string} dalquerykey  DAL Query key.
   * @param  {object} parameters   ECMA object with the paramters defined in the DAL Query. {parametername:parametervalue}
   * @param  {object} [IDVobj]     (form mode only) Dependency injection for framework 'IDVault' object. Not needed if in engine mode. Not needed if in form mode and the module has been initialized with PRD.init()
   *
   * @type {string[]}
   * @return {string[]} Array with LDAP DNs returned.
   */
  function IDVglobalQuery( dalquerykey, parameters, IDVobj ) {
    // Variable declaration. Keep all the declarations together.
    var qres = [];
    var gqr, errmsg, pconv = '', fname;
    fname = 'IDVglobalQuery(): ';
    // Adjusting function input values based on where it is being executed.
    if ( where === 'engine' ) {
      IDVobj = IDVault;
    }
    if ( where === 'form' && IDVobj == null && IDMAPPS.IDVault !== null ) {
      IDVobj = IDMAPPS.IDVault;
    }
    // Check input parameters.
    if ( dalquerykey == null || parameters == null || IDVobj == null ) {
      errmsg = [];
      errmsg.push( fname + 'missing mandatory parameters.' );
      errmsg.push( 'dalquerykey: ' + String( dalquerykey ) + ',' );
      if ( parameters === null ) {
        pconv = String( parameters );
      } else {
        pconv = JSONobj.stringify( parameters );
      }
      errmsg.push( 'parameters: ' + pconv + ',' );
      errmsg.push( 'IDVobj: ' + String( IDVobj ) + '.' );
      logerror( errmsg.join( ' ' ) );
      return qres;
    }
    // Performs the query and handles errors
    try {
      // Function call parameters are different between engine and form, as are return types.
      if ( where === 'form' ) {
        gqr = IDVobj.globalQuery( null, dalquerykey, parameters );
        if ( gqr instanceof Array && gqr[ 0 ] instanceof Array > 0 && gqr[ 0 ][ 0 ] != '' ) {
          qres = gqr[ 0 ];
        }
      }
      if ( where === 'engine' ) {
        gqr = IDVobj.globalQuery( dalquerykey, parameters );
        if ( gqr != null && gqr.size() > 0 ) {
          qres = JavaVectorToECMAArray( gqr );
        }
      }
    } catch ( e ) {
      logerror( fname + 'Error occured during IDVault.globalQuery . Aborting. Error message: ' + e.message );
    }
    return qres;
  }

  /**
   * (Engine only) Wraper for GCV.get . Attempts to retrieve the GCV value. returns the default value (or '' if no default provided)
   * @memberof PRD.util
   * @since 1.0.2
   *
   * @param {string}  GCVname       Name of the GCV to be retrieved.
   * @param {string}  returnType    'string', 'number' or 'boolean'. Forces coercion to said type for the return. Defaults to 'string if not provided or any other value.
   * @param {string}  DefaultValue  Default value to be used if the GCV.get() fails. Defaults to '' if not provided.
   * @return {(string|number|boolean)} GCV.get result or default value.
   */
  function GCVget( GCVname, returnType, DefaultValue ) {
    var ret, defval = '', fname;
    fname = 'GCVget(): ';
    if ( DefaultValue != null ) {
      defval = String( DefaultValue );
    }
    if ( GCVname != null && GCVname !== '' ) {
      GCVname = String( GCVname );
      try {
        ret = GCV.get( GCVname );
      } catch ( e ) {
        logerror( fname + 'Failed to retrieve value for GCV "' + GCVname + '", Error: ' + e.message );
      }
    } else {
      logerror( fname + 'GCVname not provided.' );
    }
    // Failed to retrieve the GCV
    if (! ret ) {
      logerror( fname + 'GCV.get( "' + GCVname + '" ) returned null value. Please make sure the same is available on the User Application driver' );
      return defval;
    }
    // Coerce result as we return it.
    switch( String( returnType ) ) {
      case 'boolean':
        return Boolean( ret );
      case 'number':
        return Number( ret );
      default: // case 'string' overlaps with this one
        return String( ret );
    }
  }

  /**
   * (Engine only) Wraper for GCV.getValueForNamedPassword. Attempts to retrieve the named password value using a
   * GCV-ref as the bridge for the same. If it fails attemps up to 5 retries with 1 second pause in between them.
   * @memberof PRD.util
   * @since 1.0.2
   *
   * @param {string}  NamedPassword  Name of the GCV-ref to the Named Password to be retrieved.
   * @param {any}     try5times      If not provided or null a single read is attempted.
   *                                 If provides and read fails try 4 more times, with 1 second pause between them.
   * @return {(string|null)} GCV.getValueForNamedPassword result or null.
   */
  function getNamedPassword( NamedPassword, try5times ) {
    var i, ret = null, fname;
    fname = 'getNamedPassword(): ';
    if ( NamedPassword != null && NamedPassword !== '' ) {
      NamedPassword = String( NamedPassword );
      if ( try5times != null ) {
        // This approach will hold the Java thread up to 5 seconds, possibly causing resource contention
        // on the workflow engine. Rule of thumb we should avoid using java.lang.Thread.sleep() inside workflows
        // on systems with medium to large load.
        try5times: {
          for ( i = 0; i < 5; i++ ){
            try {
              ret = GCV.getValueForNamedPassword( NamedPassword );
            } catch ( e ) {
              logerror( fname + 'Failed to retrieve value for Named Password "' + NamedPassword + '", Error: ' + e.message );
            }
            if ( ret != null && ret !== '' ) {
              break try5times;
            }
            // 1 second delay
            try {
              logerror( fname + 'Failed attempt ' + (i+1) + ' to retrieve Named Password "' + NamedPassword + '". Pausing for 1 second then retrying.' );
              java.lang.Thread.sleep( 1000 );
            } catch ( e ) {
              logerror( fname + 'And now failed to try and pause for a second as well. Error: ' + e.message );
            }
          }
        }
      } else {
        try {
          ret = GCV.getValueForNamedPassword( NamedPassword );
        } catch ( e ) {
          logerror( fname + 'Failed to retrieve value for Named Password "' + NamedPassword + '", Error: ' + e.message );
        }
      }
    } else {
      logerror( fname + 'NamedPassword not provided.' );
    }
    // Failed to retrieve the GCV
    if (! ret ) {
      logerror( fname + 'GCV.getValueForNamedPassword( "' + NamedPassword + '" ) returned null value. Please make sure the same is available on the User Application driver' );
      return '';
    }
    return ret;
  }

  // Engine-only API extensions:
  if ( where === 'engine' ) {
    PublicAPI.util.JavaVectorToECMAArray = JavaVectorToECMAArray;
    PublicAPI.util.ECMAArrayToJavaVector = ECMAArrayToJavaVector;
    PublicAPI.util.GCVget = GCVget;
    PublicAPI.util.getNamedPassword = getNamedPassword;
    PublicAPI.util.Unique = Unique;
    PublicAPI.util.Compare = Compare;
    PublicAPI.util.getObject2arr = getObject2arr;
    PublicAPI.util.basicHTTPauthHeader = basicHTTPauthHeader;
    PublicAPI.util.shouldRetry = shouldRetry;
  }
  // Form-only API extensions:
  if ( where === 'form' ) {
    PublicAPI.init = formInit;
  }

  return PublicAPI;
})( '===> ');