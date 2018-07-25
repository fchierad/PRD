/**
 * Parses an IDM mapping table's XML and returns a stringified JSON
 * representation of the same. Requires xml2dom() from
 * https://github.com/fchierad/PRD/blob/master/other/dom-xml.js
 * @param {string} mtxml Mapping Table XML string
 * @type {string}
 * @returns JSON stringified representation of the mapping table.
 */
function mt2json( mtxml ) {
  var mt, obj, ic, ir, topnode, coldefs, header, name, type, rows, row, col, value;
  obj = {
    table:{}, // column name:[ values ]
    header:{} // column name:'column type'
  };
  mt = xml2dom( mtxml );
  if ( mt ) {
    if ( mt.nodeName === 'mapping-table' ) {
      topnode = mt;
    }
    if ( mt.nodeName === '#document' && mt.firstChild.nodeName === 'mapping-table' ) {
      topnode = mt.firstChild;
    }
  } else {
    return '';
  }

  coldefs = topnode.getElementsByTagName( 'col-def' );
  rows = topnode.getElementsByTagName( 'row' );

  for (ic=0; ic < coldefs.length; ic++) {
    // setup column headers
    header = coldefs.item(ic);
    name = header.getAttribute('name');
    type = header.getAttribute('type');
    obj.header[ name ] = type;
    obj.table[ name ] = [];
    // fetch column values from the rows
    for (ir=0; ir < rows.length; ir++) {
      row = rows.item(ir);
      col = row.getElementsByTagName( 'col' ).item(ic);
      value = String( col.textContent ); // type:case
      if ( type === 'nocase' ) {
        value = value.toLowerCase();
      }
      if ( type === 'numeric' ) {
        value = value*1;
      }
      obj.table[ name ].push( value );
    }
  }
  return ScriptVault.JSON.stringify( obj );
}