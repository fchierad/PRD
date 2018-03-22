<a name="PRD"></a>

## PRD : <code>object</code>
Simple module to assist on workflow developmentCreated to be imported in Overview > Global Scripts and used on both forms and engine.

**Kind**: global namespace  
**Version**: 1.0.1  
**License**: MIT License  

* [PRD](#PRD) : <code>object</code>
    * [.util](#PRD.util) : <code>object</code>
        * [.formOrEngine()](#PRD.util.formOrEngine) ⇒ <code>string</code>
        * [.logerror(msg)](#PRD.util.logerror) ⇒ <code>boolean</code>
        * [.coerceToString(input, [defVal])](#PRD.util.coerceToString) ⇒ <code>string</code>
        * [.JavaVectorToECMAArray(v)](#PRD.util.JavaVectorToECMAArray) ⇒ <code>Array.&lt;string&gt;</code>
        * [.ECMAArrayToJavaVector(arr)](#PRD.util.ECMAArrayToJavaVector) ⇒ <code>java.util.Vector</code>
    * [.version()](#PRD.version) ⇒ <code>string</code>
    * [.init(field, form, IDVault)](#PRD.init)
    * [.IDVget(ldapdn, entkey, attrkey, [IDVobj])](#PRD.IDVget) ⇒ <code>Array.&lt;string&gt;</code>
    * [.IDVglobalQuery(dalquerykey, parameters, [IDVobj])](#PRD.IDVglobalQuery) ⇒ <code>Array.&lt;string&gt;</code>

<a name="PRD.util"></a>

### PRD.util : <code>object</code>
**Kind**: static namespace of [<code>PRD</code>](#PRD)  

* [.util](#PRD.util) : <code>object</code>
    * [.formOrEngine()](#PRD.util.formOrEngine) ⇒ <code>string</code>
    * [.logerror(msg)](#PRD.util.logerror) ⇒ <code>boolean</code>
    * [.coerceToString(input, [defVal])](#PRD.util.coerceToString) ⇒ <code>string</code>
    * [.JavaVectorToECMAArray(v)](#PRD.util.JavaVectorToECMAArray) ⇒ <code>Array.&lt;string&gt;</code>
    * [.ECMAArrayToJavaVector(arr)](#PRD.util.ECMAArrayToJavaVector) ⇒ <code>java.util.Vector</code>

<a name="PRD.util.formOrEngine"></a>

#### util.formOrEngine() ⇒ <code>string</code>
Try to detect if we are in a web browser or in the User App/RBPM/IDMAPPs workflow engine.

**Kind**: static method of [<code>util</code>](#PRD.util)  
**Returns**: <code>string</code> - 'form' if in a Browser, 'engine' if on the workflow engine. 'detection failed' otherwise.  
**Since**: 1.0.0  
<a name="PRD.util.logerror"></a>

#### util.logerror(msg) ⇒ <code>boolean</code>
Output error message based on where the code is running.Output to the console.log() if in a browser, to catalina.out if in the workflow engine.

**Kind**: static method of [<code>util</code>](#PRD.util)  
**Returns**: <code>boolean</code> - true if the message was returned successfully, false otherwise.  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | Error message to be logged. |

<a name="PRD.util.coerceToString"></a>

#### util.coerceToString(input, [defVal]) ⇒ <code>string</code>
Coerces the result to an ECMA string.Coercion rules for this function:If the first input parameter is null or undefined returns default value.If the first input parameter is an Array it returns the array joined by " ".If the first input parameter is a String, Number or Boolean it returns a string.If the first input parameter is an object other than an Array it returns the default value.If the second input value is not null then the default value becomes the second input value.

**Kind**: static method of [<code>util</code>](#PRD.util)  
**Returns**: <code>string</code> - resulting string.  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>any</code> | Input parameter to be coerced. |
| [defVal] | <code>string</code> | Default value to be used |

<a name="PRD.util.JavaVectorToECMAArray"></a>

#### util.JavaVectorToECMAArray(v) ⇒ <code>Array.&lt;string&gt;</code>
Converts a unidimensional Java Vector whose entries are strings to an ECMA Array.https://docs.oracle.com/javase/8/docs/api/java/util/Vector.html

**Kind**: static method of [<code>util</code>](#PRD.util)  
**Returns**: <code>Array.&lt;string&gt;</code> - ECMA array.  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| v | <code>java.util.Vector</code> | Java Vector. |

<a name="PRD.util.ECMAArrayToJavaVector"></a>

#### util.ECMAArrayToJavaVector(arr) ⇒ <code>java.util.Vector</code>
Converts a unidimensional ECMA array whose entries are strings to a Java Vector.https://docs.oracle.com/javase/8/docs/api/java/util/Vector.html

**Kind**: static method of [<code>util</code>](#PRD.util)  
**Returns**: <code>java.util.Vector</code> - Java Vector.  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| arr | <code>Array.&lt;string&gt;</code> | ECMA array. |

<a name="PRD.version"></a>

### PRD.version() ⇒ <code>string</code>
Return module version

**Kind**: static method of [<code>PRD</code>](#PRD)  
**Returns**: <code>string</code> - Module's version in the format M.m.p (Major, minor, patch)  
**Since**: 1.0.1  
<a name="PRD.init"></a>

### PRD.init(field, form, IDVault)
Initializes references to the IDMAPPs framework objects and save the same in the internal storage.Returns nothing.

**Kind**: static method of [<code>PRD</code>](#PRD)  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| field | <code>object</code> | IDMAPPS framework field object |
| form | <code>object</code> | IDMAPPS framework form object |
| IDVault | <code>object</code> | IDMAPPS framework IDVault object |

<a name="PRD.IDVget"></a>

### PRD.IDVget(ldapdn, entkey, attrkey, [IDVobj]) ⇒ <code>Array.&lt;string&gt;</code>
Performs an IDVault.get and returns an ECMA array with the result.

**Kind**: static method of [<code>PRD</code>](#PRD)  
**Returns**: <code>Array.&lt;string&gt;</code> - ECMA array with the results. Empty if IDVault.get returned null, array with one or more elements otherwise.  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| ldapdn | <code>string</code> | LDAP Fully Distinguised name of the eDirectory object to be queried. |
| entkey | <code>string</code> | DAL entity key. |
| attrkey | <code>string</code> | DAL attribute key. Attrribute must be configured under the DAL entity. |
| [IDVobj] | <code>object</code> | (form mode only) Dependency injection for framework 'IDVault' object. Not needed if in engine mode. Not needed if in form mode and the module has been initialized with PRD.init() |

<a name="PRD.IDVglobalQuery"></a>

### PRD.IDVglobalQuery(dalquerykey, parameters, [IDVobj]) ⇒ <code>Array.&lt;string&gt;</code>
Performs an IDVault.globalQuery and returns an object with the result.

**Kind**: static method of [<code>PRD</code>](#PRD)  
**Returns**: <code>Array.&lt;string&gt;</code> - Array with LDAP DNs returned.  
**Since**: 1.0.1  

| Param | Type | Description |
| --- | --- | --- |
| dalquerykey | <code>string</code> | DAL Query key. |
| parameters | <code>object</code> | ECMA object with the paramters defined in the DAL Query. {parametername:parametervalue} |
| [IDVobj] | <code>object</code> | (form mode only) Dependency injection for framework 'IDVault' object. Not needed if in engine mode. Not needed if in form mode and the module has been initialized with PRD.init() |

