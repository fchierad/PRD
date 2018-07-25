// Tested with IDM 4.5 and IDM 4.6
/**
 * Reads a well formed XML string and returns a DOM object built from it.
 * function will only work on the work flow engine, not on forms.
 * @param  {string} xmlstr Well formed XML string
 * @type {object}
 * @returns DOM object built using Java bindings. On error will print error message to the web server's log
 *    and return boolean false (check for it before using the object).
 */
function xml2dom( xmlstr ) {
  var parser, charset, is, dom = false;
  try {
    parser = new Packages.javax.xml.parsers.DocumentBuilderFactory.newInstance().newDocumentBuilder();
    charset = Packages.java.nio.charset.StandardCharsets.UTF_8;
    is = new Packages.java.io.ByteArrayInputStream( java.lang.String( xmlstr ).getBytes( charset ) );
    dom = parser.parse( is );
  } catch( e ) {
    java.lang.System.out.println( process.getRequestId() + ': xml2dom(): ' + e.message );
    return false;
  }
  return dom;
}

/**
 * Converts a DOM object to serialized XML.
 * function will only work on the work flow engine, not on forms.
 * @param  {object} domobj DOM object
 * @type {string}
 * @returns DOM object built using Java bindings. On error will print error message to the web server's log
 *    and return boolean false (check for it before using the string).
 */
function dom2xml( domobj ) {
  var transformer, domsource, sr, xml;
  try {
    transformer = new Packages.javax.xml.transform.TransformerFactory.newInstance().newTransformer();
    transformer.setOutputProperty( 'omit-xml-declaration', 'yes' );
    domsource = new Packages.javax.xml.transform.dom.DOMSource( domobj );
    sr = new Packages.javax.xml.transform.stream.StreamResult( new java.io.StringWriter() );
    transformer.transform( domsource, sr );
    xml = sr.getWriter().toString();
  } catch( e ) {
    java.lang.System.out.println( process.getRequestId() + ': dom2xml(): ' + e.message );
    return false;
  }
  return String( xml );
}