/**
 * Simple module to assist on workflow development
 * Created to be imported in Overview > Global Scripts and used on both forms and engine.
 * @namespace PRD
 * @version 1.0.1
 * @license MIT License
 */
var PRD = (function IIFE() {
	// Exported public API. Functions and variables not declared here will remain private to this module
	var PublicAPI = {
		util: {
			formOrEngine:formOrEngine,
			logerror:logerror,
			coerceToString:coerceToString
		},
		version:version,
		IDVget:IDVget,
		IDVglobalQuery:IDVglobalQuery
	};

	/**
	 * @namespace util
	 * @memberof PRD
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
	var JSONobj;
	// Setup a pointer to the JSON object since its name differs on forms and engine.
	if ( where === 'engine' ) {
		JSONobj = ScriptVault.JSON;
	}
	if ( where === 'form' ) {
		JSONobj = JSON;
	}

	/**
	 * Return module version
	 *
	 * @memberof PRD
	 * @since 1.0.1
	 *
	 * @type {string}
	 * @return {string} Module's version in the format M.m.p (Major, minor, patch)
	 */
	function version() {
		return '1.0.1';
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
		var requestID;
		// Coercing log message via String() to avoid null and undefined results being passed to the log mechanism.
		msg = String( msg );
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
				console.log( msg );
			}
			if ( where === 'engine' ) {
				java.lang.System.out.println( requestID + msg );
			}
		} catch ( e ) {
			// discarding error, since this is an error about printing the error message...
			return false;
		}
		return true;
	}

	/**
	 * Initializes references to the IDMAPPs framework objects and save the same in the internal storage.
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
	 * If the first input parameter is an Array it returns the array joined by " ".
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
		var ret = "";
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
	 * Converts a unidimensional Java Vector whose entries are strings to an ECMA Array.
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
		var it, res = [];
		if ( where !== 'engine' ) {
			logerror( 'JavaVectorToECMAArray(): can only be used in the workflow engine.' );
			return;
		}
		if ( v != null && typeof v === 'object' && v.size() > 0 ) {
			try {
				it = v.iterator();
				while( it.hasNext() ) {
					res.push( String( it.next() ) );
				}
			} catch( e ) {
				logerror( 'JavaVectorToECMAArray(): Error converting Vector into Array: ' + e.message );
			}
		}
		return res;
	}

	/**
	 * Converts a unidimensional ECMA array whose entries are strings to a Java Vector.
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
		var i, res, JString;
		if ( where !== 'engine' ) {
			logerror( 'ECMAArrayToJavaVector(): can only be used in the workflow engine.' );
			return;
		}
		try {
			JString = java.lang.String;
			res = new java.util.Vector();
			for ( i = 0; i < arr.length; i++ ) {
				res.add( JString( arr[ i ] ) );
			}
			return res;
		} catch( e ) {
			logerror( 'ECMAArrayToJavaVector(): Error converting Array into Vector: ' + e.message );
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
		var gattr, gattrV, errmsg;
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
			errmsg.push( 'PRD.IDVget() missing mandatory parameters.' );
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
			logerror( 'IDVget(): Error occured during IDVault.get query. Aborting. Error message: ' + e.message );
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
		var gqr, errmsg, pconv = '';
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
			errmsg.push( 'PRD.IDVglobalQuery() missing mandatory parameters.' );
			errmsg.push( 'dalquerykey: ' + String( dalquerykey ) + ',' );
			if ( parameters === null ) {
				pconv = String( parameters );
			} else {
				try {
					pconv = JSONobj.stringify(parameters);
				} catch ( e ) {
					errmsg.push( 'failed to parse argument parameters into JSON, error: ' + e.message + ',');
				}
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
			logerror( 'IDVglobalQuery(): Error occured during IDVault.globalQuery . Aborting. Error message: ' + e.message );
		}
		return qres;
	}

	// Engine-only API extensions:
	if ( where === 'engine' ) {
		PublicAPI.util.JavaVectorToECMAArray = JavaVectorToECMAArray;
		PublicAPI.util.ECMAArrayToJavaVector = ECMAArrayToJavaVector;
	}
	// Form-only API extensions:
	if ( where === 'form' ) {
		PublicAPI.init = formInit;
	}

	return PublicAPI;
})();