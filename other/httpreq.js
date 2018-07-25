// Tested with IDM 4.5 and 4.6 . IDMProv.war includes commons-httpclient-3.1.jar so using its methods.
// https://hc.apache.org/httpclient-3.x/apidocs/
/**
 * Issue HTTP GET and return response object.
 * @param {string}  uri        HTTP REST endpoint full URI
 * @param {string=} [user]     REST endpoint authentication user's ID
 * @param {string=} [pwd]      REST endpoint authentication user's password
 * @param {object=} [headers]  headers to be added to the HTTP request
 * @type {object}
 * @returns ECMA object with HTTP response status, headers and body as direct properties.
 */

function httpget( uri, user, pwd, headers ) {
  var JString, method, creds;
  JString = java.lang.String;
  method = new Packages.org.apache.commons.httpclient.methods.GetMethod( JString(uri) );
  if ( user && pwd ) {
    creds = new Packages.org.apache.commons.httpclient.UsernamePasswordCredentials( JString(user), JString(pwd) );
  }
  return httpreq( method, creds, headers );
}

/**
 * Issue HTTP POST and return response object.
 * @param {string}  uri        HTTP REST endpoint full URI
 * @param {string=} [user]     REST endpoint authentication user's ID
 * @param {string=} [pwd]      REST endpoint authentication user's password
 * @param {object=} [headers]  headers to be added to the HTTP request
 * @param {string}  content    The content to sent to the HTTP server
 * @param {string=} [conttype] The type of the content, or null. The value retured by getContentType(). If this content type contains a charset and the charset parameter is null, the content's type charset will be used. http://www.iana.org/assignments/media-types/media-types.xhtml . if null defaults to 'application/x-www-form-urlencoded'
 * @param {string=} [charset]  The charset of the content, or null. Used to convert the content to bytes. If the content type does not contain a charset and charset is not null, then the charset will be appended to the content type. if null defaults to 'utf-8'
 * @type {object}
 * @returns ECMA object with HTTP response status, headers and body as direct properties.
 */

function httppost( uri, user, pwd, headers, content, conttype, charset ) {
  var JString, method, creds;
  JString = java.lang.String;
  method = new Packages.org.apache.commons.httpclient.methods.PostMethod( JString(uri) );
  if ( content ) {
    if ( ! conttype ) {
      conttype = 'application/x-www-form-urlencoded';
    }
    if ( ! charset ) {
      charset = 'utf-8';
    }
    // setRequestEntity used for PUT/POST only. Set entity for request.
    method.setRequestEntity(new Packages.org.apache.commons.httpclient.methods.StringRequestEntity( JString(content), JString(conttype), JString(charset) ));
  }
  if ( user && pwd ) {
    creds = new Packages.org.apache.commons.httpclient.UsernamePasswordCredentials( JString(user), JString(pwd) );
  }
  return httpreq( method, creds, headers );
}

/**
 * Issue HTTP call and return response object. Customize headers and other needs inside the code.
 * @param {object} method   http commons method object
 * @param {object} creds    http commons credentials object
 * @param {object} headers  HTTP headers to be added to the request
 * @type {object}
 * @returns ECMA object with HTTP response status, headers and body as direct properties.
 */
function httpreq( method, creds, headers ) {
  var JString, client, h, status, respheaders, respbody, rheaders, i, br, line ;
  JString = java.lang.String;
  try {
    client = new Packages.org.apache.commons.httpclient.HttpClient();
    if ( creds && typeof creds === 'object' ) {
      client.getParams().setAuthenticationPreemptive(true);
      client.getState().setCredentials(Packages.org.apache.commons.httpclient.auth.AuthScope.ANY, creds);
    }
    if ( headers && typeof headers === 'object' ) {
      for ( h in headers ) {
        method.setRequestHeader( JString(h), JString(headers[h]) );
      }
    }
    status = 0;
    respheaders = {};
    respbody = '';
    // Makes HTTP request
    status = client.executeMethod(method);
    // Retrieves response headers if any
    rheaders = method.getResponseHeaders();
    for ( i = 0; i < rheaders.length; i++ ) {
      respheaders[ String( rheaders[i].getName() ) ] = String( rheaders[i].getValue() );
    }
    // Retrieves response body if any
    br = new java.io.BufferedReader( new java.io.InputStreamReader( method.getResponseBodyAsStream() ) );
    line = br.readLine();
    while(line != null){
      respbody = respbody + line;
      line = br.readLine();
    }
  } catch (e) {
    java.lang.System.out.println( process.getRequestId() + ': httpreq: ' + e.message );
  }
  // Ensure connection is released
  try {
    method.releaseConnection();
  } catch (e) {
    java.lang.System.out.println( process.getRequestId() + ': httpreq: ' + e.stack );
  }
  return {
    status:status,
    headers:respheaders,
    body:respbody
  };
}