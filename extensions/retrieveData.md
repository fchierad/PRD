<a name="module_retrieveData"></a>

## retrieveData
retrieveData - PRD extension, usable on the form only.<br/>Creates functions that will perform object queries for multiple attributes at different detail levels,while caching the results per LDAP DN in the local browser session. Cache expires on page/form/module reload. <br/>Module loads as PRD.extensions.retrieveData<br/>

**Requires**: <code>module:PRD</code>  
**Version**: 1.0.1  
**License**: MIT License  

* [retrieveData](#module_retrieveData)
    * _static_
        * [.version()](#module_retrieveData.version) ⇒ <code>string</code>
        * [.clearcache()](#module_retrieveData.clearcache)
        * [.removefromcache(ldapdn)](#module_retrieveData.removefromcache) ⇒ <code>boolean</code>
        * [.listentries()](#module_retrieveData.listentries) ⇒ <code>Array.&lt;string&gt;</code>
        * [.factory(dalEntity, mapObject, [childFnLogName])](#module_retrieveData.factory) ⇒ <code>function</code>
            * [~readEntity(ldapdn, detaillvl)](#module_retrieveData.factory..readEntity) ⇒ <code>object</code>
    * _inner_
        * [~attributemap](#module_retrieveData..attributemap) : <code>object</code>

<a name="module_retrieveData.version"></a>

### retrieveData.version() ⇒ <code>string</code>
Return extension version.

**Kind**: static method of [<code>retrieveData</code>](#module_retrieveData)  
**Returns**: <code>string</code> - Module's version in the format M.m.p (Major, minor, patch)  
**Since**: 1.0.0  
<a name="module_retrieveData.clearcache"></a>

### retrieveData.clearcache()
Clear module's query cache. Returns nothing.

**Kind**: static method of [<code>retrieveData</code>](#module_retrieveData)  
**Since**: 1.0.0  
<a name="module_retrieveData.removefromcache"></a>

### retrieveData.removefromcache(ldapdn) ⇒ <code>boolean</code>
Remove a single LDAP DN from the cache.

**Kind**: static method of [<code>retrieveData</code>](#module_retrieveData)  
**Returns**: <code>boolean</code> - true if cache entry removed successfully, false if entry was not present.  
**Since**: 1.0.1  

| Param | Type | Description |
| --- | --- | --- |
| ldapdn | <code>string</code> | User DN in FQDN LDAP format |

<a name="module_retrieveData.listentries"></a>

### retrieveData.listentries() ⇒ <code>Array.&lt;string&gt;</code>
Lists all cached entries LDAP DNs.

**Kind**: static method of [<code>retrieveData</code>](#module_retrieveData)  
**Returns**: <code>Array.&lt;string&gt;</code> - Array of strings containing all cached DNs.  
**Since**: 1.0.1  
<a name="module_retrieveData.factory"></a>

### retrieveData.factory(dalEntity, mapObject, [childFnLogName]) ⇒ <code>function</code>
Generate retrieval function for objects where the function reads multiple DAL attributes.

**Kind**: static method of [<code>retrieveData</code>](#module_retrieveData)  
**Returns**: <code>function</code> - readEntity function for the selected DAL entity and map object.  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| dalEntity | <code>string</code> | DAL entity key. |
| mapObject | <code>attributemap</code> | Map Object in the format. { 'level of details':[ attribute array ],... } |
| [childFnLogName] | <code>string</code> | Trace name to be used by the generated function. |

**Example**  
```js
var mapobj = {extended:[ 'CN', 'FirstName', 'LastName', 'Title', 'Description' ],base:[ 'CN', 'FirstName', 'LastName' ]};// Returns an instance of the function readEntity into the userdata variable:var userdata = PRD.extensions.retrieveData.factory( 'user', mapobj, 'userdata' );// Queries details from cwookie. Since no detail level was passed it will default the first mapobj key in alphabetical order.var userinfo = userdata( 'cn=cwookie,ou=users,o=data' );// This time the detail level desired has been set, so will return the attribute values from the 'extended' property's Array.var usermoreinfo = userdata( 'cn=cwookie,ou=users,o=data', 'extended' );// userinfo will contain:// userinfo.CN with the value [ 'cwookie' ]// userinfo.FirstNAme with the value [ 'Chewie' ]// userinfo.LastName with the value [ 'Wookie' ]// usermoreinfo will contain the same values plus the usermoreinfo.<attribute> = [ attribute values] for Title and Description
```
<a name="module_retrieveData.factory..readEntity"></a>

#### factory~readEntity(ldapdn, detaillvl) ⇒ <code>object</code>
Retrieves DAL entity key's details

**Kind**: inner method of [<code>factory</code>](#module_retrieveData.factory)  
**Returns**: <code>object</code> - ECMA object whose properties are created using the attribute's DAL key and their values are the attribute's value.  If invalid parameters are passed an empty object is returned.  

| Param | Type | Description |
| --- | --- | --- |
| ldapdn | <code>string</code> | User DN in FQDN LDAP format |
| detaillvl | <code>string</code> | How much information to retrieve, as defined in the provided map object |

<a name="module_retrieveData..attributemap"></a>

### retrieveData~attributemap : <code>object</code>
mapObject structure, used to define detail level and corresnponding attributes for the factory().

**Kind**: inner typedef of [<code>retrieveData</code>](#module_retrieveData)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| ...detaillevel | <code>string</code> | ECMA Object property whose actual name is the detail level to be selected when calling the generated function. |
| detaillevel.attributeArray | <code>Array.&lt;string&gt;</code> | DAL attribute key values for attributes to be queried at that detail level. |

