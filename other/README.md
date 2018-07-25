# PRD / other
Stand-alone functions and imports for use with Identity Manager work flows.

* work flow engine/back-end
  * <a href="dom-xml.js">dom-xml.js</a>: Collection of functions that stand on their own to convert DOM objects to XML and XML top DOM objects.
    * xml2dom(): Reads a well formed XML string and returns a DOM object built from it.
    * dom2xml(): onverts a DOM object to serialized XML.
  * <a href="httpreq.js">httpreq.js</a>: Collection of functions that stand on their own to issue HTTP GET and POST calls from the work flow engine.
    * httpget(): Issue HTTP GET and return response object.
    * httppost(): Issue HTTP POST and return response object.
    * httpreq(): Issue HTTP call and return response object. Used by the individual method functions, use this function to implement other HTTP methods as needed.
  * <a href="parseMappingTable.js">parseMappingTable.js</a>: Function to convert an IDM driver's mapping table to a JSON string representation of an ECMA object.
    * mt2json():  Parses an IDM mapping table's XML and returns a stringified JSON representation of the same. Requires xml2dom() from dom-xml.js.
  * <a href="parseMappingTable_DAL_DirXML-Resource">parseMappingTable_DAL_DirXML-Resource</a>: XML export of the DAL entity used to retrieve an IDM driver's mapping table with IDVault.get( ldapdn, 'DirXML-Resource', 'DirXML-Data' ). Example ldapdn 'cn=mappingtable,cn=driver,cn=driverset,o=system'.
