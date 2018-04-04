<a name="PRD"></a>

## PRD : <code>object</code>
Simple module to assist on workflow developmentCreated to be imported in Overview > Global Scripts and used on both forms and engine.

**Kind**: global namespace  
**Version**: 1.0.2  
**License**: MIT License  

* [PRD](#PRD) : <code>object</code>
    * [.util](#PRD.util) : <code>object</code>
        * [.formOrEngine()](#PRD.util.formOrEngine) ⇒ <code>string</code>
        * [.logerror(msg)](#PRD.util.logerror) ⇒ <code>boolean</code>
        * [.coerceToString(input, [defVal])](#PRD.util.coerceToString) ⇒ <code>string</code>
        * [.Compare(list1, list2, ignorecase)](#PRD.util.Compare) ⇒ <code>Array.&lt;Array.&lt;string&gt;&gt;</code>
        * [.Unique(obj, ignorecase)](#PRD.util.Unique) ⇒ <code>Array.&lt;string&gt;</code> \| <code>java.util.Vector</code>
        * [.getObject2arr(list)](#PRD.util.getObject2arr) ⇒ <code>array.&lt;(object\|string)&gt;</code> \| <code>null</code>
        * [.JavaVectorToECMAArray(v)](#PRD.util.JavaVectorToECMAArray) ⇒ <code>Array.&lt;string&gt;</code>
        * [.ECMAArrayToJavaVector(arr)](#PRD.util.ECMAArrayToJavaVector) ⇒ <code>java.util.Vector</code>
        * [.GCVget(GCVname, returnType, DefaultValue)](#PRD.util.GCVget) ⇒ <code>string</code> \| <code>number</code> \| <code>boolean</code>
        * [.getNamedPassword(NamedPassword, try5times)](#PRD.util.getNamedPassword) ⇒ <code>string</code> \| <code>null</code>
    * [.JSONobj()](#PRD.JSONobj)
    * [.version()](#PRD.version) ⇒ <code>string</code>
    * [.setlogprefix(str)](#PRD.setlogprefix)
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
    * [.Compare(list1, list2, ignorecase)](#PRD.util.Compare) ⇒ <code>Array.&lt;Array.&lt;string&gt;&gt;</code>
    * [.Unique(obj, ignorecase)](#PRD.util.Unique) ⇒ <code>Array.&lt;string&gt;</code> \| <code>java.util.Vector</code>
    * [.getObject2arr(list)](#PRD.util.getObject2arr) ⇒ <code>array.&lt;(object\|string)&gt;</code> \| <code>null</code>
    * [.JavaVectorToECMAArray(v)](#PRD.util.JavaVectorToECMAArray) ⇒ <code>Array.&lt;string&gt;</code>
    * [.ECMAArrayToJavaVector(arr)](#PRD.util.ECMAArrayToJavaVector) ⇒ <code>java.util.Vector</code>
    * [.GCVget(GCVname, returnType, DefaultValue)](#PRD.util.GCVget) ⇒ <code>string</code> \| <code>number</code> \| <code>boolean</code>
    * [.getNamedPassword(NamedPassword, try5times)](#PRD.util.getNamedPassword) ⇒ <code>string</code> \| <code>null</code>

<a name="PRD.util.formOrEngine"></a>

#### util.formOrEngine() ⇒ <code>string</code>
Try to detect if we are in a web browser or in the User App/RBPM/IDMAPPs workflow engine.

**Kind**: static method of [<code>util</code>](#PRD.util)  
**Returns**: <code>string</code> - 'form' if in a Browser, 'engine' if on the workflow engine. 'detection failed' otherwise.  
**Since**: 1.0.0  
<a name="PRD.util.logerror"></a>

#### util.logerror(msg) ⇒ <code>boolean</code>
Output error message based on where the code is running.Output to the console.log() if in a browser, to catalina.out if in the workflow engine.Prepends the value of the module's internal 'prefix' variable.

**Kind**: static method of [<code>util</code>](#PRD.util)  
**Returns**: <code>boolean</code> - true if the message was returned successfully, false otherwise.  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | Error message to be logged. |

<a name="PRD.util.coerceToString"></a>

#### util.coerceToString(input, [defVal]) ⇒ <code>string</code>
Coerces the result to an ECMA string.Coercion rules for this function:If the first input parameter is null or undefined returns default value.If the first input parameter is an Array it returns the array joined by ' '.If the first input parameter is a String, Number or Boolean it returns a string.If the first input parameter is an object other than an Array it returns the default value.If the second input value is not null then the default value becomes the second input value.

**Kind**: static method of [<code>util</code>](#PRD.util)  
**Returns**: <code>string</code> - resulting string.  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>any</code> | Input parameter to be coerced. |
| [defVal] | <code>string</code> | Default value to be used |

<a name="PRD.util.Compare"></a>

#### util.Compare(list1, list2, ignorecase) ⇒ <code>Array.&lt;Array.&lt;string&gt;&gt;</code>
(Engine only) Compares 2 unidimensional ECMA Arrays or Java Vectors and an Array of arrays with comparison results.

**Kind**: static method of [<code>util</code>](#PRD.util)  
**Returns**: <code>Array.&lt;Array.&lt;string&gt;&gt;</code> - ECMA Array with 3 parts. [ [ elements only present on list1 ], [ elements only present on list2 ], [ elements present on both] ]  
**Since**: 1.0.2  

| Param | Type | Description |
| --- | --- | --- |
| list1 | <code>Array.&lt;string&gt;</code> \| <code>java.util.Vector</code> | ECMA Array or Java Vector. |
| list2 | <code>Array.&lt;string&gt;</code> \| <code>java.util.Vector</code> | ECMA Array or Java Vector. |
| ignorecase | <code>boolean</code> | Changes string comparison to case insensitive. |

<a name="PRD.util.Unique"></a>

#### util.Unique(obj, ignorecase) ⇒ <code>Array.&lt;string&gt;</code> \| <code>java.util.Vector</code>
(Engine only) Parses an unidimensional ECMA Array or Java Vector and returns the same type of object with only unique entries.

**Kind**: static method of [<code>util</code>](#PRD.util)  
**Returns**: <code>Array.&lt;string&gt;</code> \| <code>java.util.Vector</code> - ECMA Array or Java Vector. If obj is not a valid type returns empty ECMA Array.  
**Since**: 1.0.2  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>Array.&lt;string&gt;</code> \| <code>java.util.Vector</code> | ECMA Array or Java Vector. |
| ignorecase | <code>boolean</code> | Changes string comparison to case insensitive.                                                    This means the casing of the results will match the casing of their                                                    first time appearing in the list provided. |

<a name="PRD.util.getObject2arr"></a>

#### util.getObject2arr(list) ⇒ <code>array.&lt;(object\|string)&gt;</code> \| <code>null</code>
(Engine only) Parses the result from flowdata.getObject into an Array of strings and ECMA objects.Each DOM element node will be an object's property name, and each property will containan array of items. Those items cam be strings or other objects.

**Kind**: static method of [<code>util</code>](#PRD.util)  
**Returns**: <code>array.&lt;(object\|string)&gt;</code> \| <code>null</code> - ECMA Array of objects and string. If error occur returns null.  
**Since**: 1.0.2  

| Param | Type | Description |
| --- | --- | --- |
| list | <code>java.util.ArrayList</code> | Java object resulting from flowdata.getObject() |

<a name="PRD.util.JavaVectorToECMAArray"></a>

#### util.JavaVectorToECMAArray(v) ⇒ <code>Array.&lt;string&gt;</code>
(Engine only) Converts a unidimensional Java Vector whose entries are strings to an ECMA Array.https://docs.oracle.com/javase/8/docs/api/java/util/Vector.html

**Kind**: static method of [<code>util</code>](#PRD.util)  
**Returns**: <code>Array.&lt;string&gt;</code> - ECMA array.  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| v | <code>java.util.Vector</code> | Java Vector. |

<a name="PRD.util.ECMAArrayToJavaVector"></a>

#### util.ECMAArrayToJavaVector(arr) ⇒ <code>java.util.Vector</code>
(Engine only) Converts a unidimensional ECMA array whose entries are strings to a Java Vector.https://docs.oracle.com/javase/8/docs/api/java/util/Vector.html

**Kind**: static method of [<code>util</code>](#PRD.util)  
**Returns**: <code>java.util.Vector</code> - Java Vector.  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| arr | <code>Array.&lt;string&gt;</code> | ECMA array. |

<a name="PRD.util.GCVget"></a>

#### util.GCVget(GCVname, returnType, DefaultValue) ⇒ <code>string</code> \| <code>number</code> \| <code>boolean</code>
(Engine only) Wraper for GCV.get . Attempts to retrieve the GCV value. returns the default value (or '' if no default provided)

**Kind**: static method of [<code>util</code>](#PRD.util)  
**Returns**: <code>string</code> \| <code>number</code> \| <code>boolean</code> - GCV.get result or default value.  
**Since**: 1.0.2  

| Param | Type | Description |
| --- | --- | --- |
| GCVname | <code>string</code> | Name of the GCV to be retrieved. |
| returnType | <code>string</code> | 'string', 'number' or 'boolean'. Forces coercion to said type for the return. Defaults to 'string if not provided or any other value. |
| DefaultValue | <code>string</code> | Default value to be used if the GCV.get() fails. Defaults to '' if not provided. |

<a name="PRD.util.getNamedPassword"></a>

#### util.getNamedPassword(NamedPassword, try5times) ⇒ <code>string</code> \| <code>null</code>
(Engine only) Wraper for GCV.getValueForNamedPassword. Attempts to retrieve the named password value using aGCV-ref as the bridge for the same. If it fails attemps up to 5 retries with 1 second pause in between them.

**Kind**: static method of [<code>util</code>](#PRD.util)  
**Returns**: <code>string</code> \| <code>null</code> - GCV.getValueForNamedPassword result or null.  
**Since**: 1.0.2  

| Param | Type | Description |
| --- | --- | --- |
| NamedPassword | <code>string</code> | Name of the GCV-ref to the Named Password to be retrieved. |
| try5times | <code>any</code> | If not provided or null a single read is attempted.                                 If provides and read fails try 4 more times, with 1 second pause between them. |

<a name="PRD.JSONobj"></a>

### PRD.JSONobj()
Proxy for the actual JSON object used in browsers (JSON) or workflow engine (ScriptVault.JSON).Wraps the parse() and stringify() calls in try/catch blocks to report errors via logerror() instead ofletting the workflow engine break its regular flow when an error occurs.

**Kind**: static method of [<code>PRD</code>](#PRD)  
**Since**: 1.0.2  
<a name="PRD.version"></a>

### PRD.version() ⇒ <code>string</code>
Return module version

**Kind**: static method of [<code>PRD</code>](#PRD)  
**Returns**: <code>string</code> - Module's version in the format M.m.p (Major, minor, patch)  
**Since**: 1.0.1  
<a name="PRD.setlogprefix"></a>

### PRD.setlogprefix(str)
Set prefix for the log activities generated by logerror() on both engine and form.Given that forms instantiate the module on load, setting the value inside a form would affect only said form.Given that the workflow engine can pause processing at points and remove the thread from memory, reading the sameagain later, calling this function anywhere outside the Overview > Global Scripts might cause the value set to be lostafter such pauses. One example of such pauses/behavior is when a workflow reaches an approval activity.

**Kind**: static method of [<code>PRD</code>](#PRD)  
**Since**: 1.0.2  

| Param | Type | Description |
| --- | --- | --- |
| str | <code>string</code> | String that will be appended to any logerror() call. |

<a name="PRD.init"></a>

### PRD.init(field, form, IDVault)
(Form only) Initializes references to the IDMAPPs framework objects and save the same in the internal storage.Returns nothing.

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

