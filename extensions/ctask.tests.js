// Mocha tests for ctask
/* global ctask, expect */
(function MochaIIFE() {
  // Compare 2 unidimentional arrays, returns true if both have the same strings inside
  const compareArrays = (arr1, arr2) => {
    let a1 = arr1.slice().sort();
    let a2 = arr2.slice().sort();
    if (a1.length === a2.length) {
      for (let i in a1) {
        if (a1[i] !== a2[i]) {
          return false;
        }
      }
    } else {
      return false;
    }
    return true;
  };
  // Compare 2 objects with 1 tier of properties, returns true if both have the same property names and values
  const compareObjects = (obj1, obj2) => {
    let a1 = Object.keys( obj1 ).sort();
    let a2 = Object.keys( obj2 ).sort();
    if (a1.length === a2.length) {
      for (let key in a1) {
        if (!a2[key]) {
          return false;
        }
        if (a1[key] instanceof Array) {
          if ( ! compareArrays(a1[key], a2[key]) ) {
            return false;
          }
        } else if (a1[key] !== a2[key]) {
          return false;
        }
      }
    } else {
      return false;
    }
    return true;
  };
  // Shallow object copy, returns object copy without references to the original object or its arrays.
  // Does not handle child objects or undefined values in properties.
  const shallowObjectCopy = ( obj ) => {
    let res;
    res = {};
    Object.keys( obj ).forEach(function shallpwPropCopy(key) {
      if (obj[key] instanceof Array) {
        res[key] = obj[key].slice();
      } else {
        if ( obj[key] === void 0 || ( obj[key] !== null && typeof obj[key] === 'object') ) {
          return;
        }
        res[key] = obj[key];
      }
    });
    return res;
  };
  // API properties for comparison
  const partAPIprops = [ 'add', 'addproperty', 'destroy', 'getEntryReference', 'has',
    'hasproperty', 'listentries', 'listproperties', 'name', 'read', 'readAll',
    'readproperty', 'remove', 'removeproperty', 'updateproperty'];
  const entryAPIprops = [ 'add', 'destroy', 'has', 'listproperties', 'name', 'read',
    'remove', 'update'];

  const MAIN_PARTITION_NAME = 'ctask_main_partition';
  const TEMP_PARTITION_NAME = 'test partition';
  const ENTRY_PARTITION_NAME = 'entrytests';
  const PROPERTY_PARTITION_NAME = 'propertytests';

  describe('Module loaded', () => {
    it('Module loaded as globalScope.ctask', () => {
      expect(ctask).to.not.equal(void 0);
    });
  });

  // Partition level tests
  describe('#Partition', () => {
    it('Check for presence of listpartitions().', () => {
      expect(ctask.hasOwnProperty('listpartitions')).to.equal(true);
    });
    it('List current partitions.', () => {
      let partitionlist = [ MAIN_PARTITION_NAME ];
      expect( compareArrays(ctask.listpartitions(), partitionlist) ).to.equal(true);
    });

    it('Check for presence of partitionexists().', () => {
      expect(ctask.hasOwnProperty('partitionexists')).to.equal(true);
    });
    it('Check for presence of main partition.', () => {
      expect( ctask.partitionexists( MAIN_PARTITION_NAME ) ).to.equal(true);
    });
    it('Check for presence of a non-existing partition.', () => {
      expect( ctask.partitionexists( 'shouldnotbepresentatthispoint' ) ).to.equal(false);
    });

    it('Check for presence of createpartition().', () => {
      expect(ctask.hasOwnProperty('createpartition')).to.equal(true);
    });
    it('Create temporary partition.', () => {
      let partitionlist = [ MAIN_PARTITION_NAME, TEMP_PARTITION_NAME ];
      ctask.createpartition( TEMP_PARTITION_NAME );
      expect( compareArrays(ctask.listpartitions(), partitionlist) ).to.equal(true);
    });
    it('Attempt to create a partition with already existing name. Should return null.', () => {
      expect( ctask.createpartition( MAIN_PARTITION_NAME ) ).to.equal(null);
    });

    it('Check for presence of destroypartition().', () => {
      expect(ctask.hasOwnProperty('destroypartition')).to.equal(true);
    });
    it('Destroy temporary partition.', () => {
      let partitionlist = [ MAIN_PARTITION_NAME ];
      ctask.destroypartition( TEMP_PARTITION_NAME );
      expect( compareArrays(ctask.listpartitions(), partitionlist) ).to.equal(true);
    });
    it('Attempt to destroy the main partition. Should be blocked from working.', () => {
      expect( ctask.destroypartition( MAIN_PARTITION_NAME ) ).to.equal(false);
    });
    it('Validate main partition still exists after prior test.', () => {
      expect( ctask.partitionexists( MAIN_PARTITION_NAME ) ).to.equal(true);
    });

  });

  // Entry level tests
  describe('#Entry', () => {
    let entrypartition;
    describe('Entry tests initialization', () => {
      it('Create partition for entry tests.', () => {
        let partitionlist = [ MAIN_PARTITION_NAME, ENTRY_PARTITION_NAME ];
        entrypartition = ctask.createpartition( ENTRY_PARTITION_NAME );
        expect( compareArrays(ctask.listpartitions(), partitionlist) ).to.equal(true);
      });
      it('Validate the properties for partition reference returned.', () => {
        expect( compareArrays(Object.keys( entrypartition ), partAPIprops ) ).to.equal(true);
      });
    });
    describe('Entry tests', () => {
      let entry1obj, entry2obj, entry1uuid, entry2uuid, all1, all2,
        addpropval, prop1name, prop1value, prop2name, prop2value,
        prop3name, prop3value, prop4name, prop4value, prop5name, prop5value;
      // entry names
      entry1uuid = 'TestUser001';
      entry2uuid = '4ce86956-6e82-4e80-9850-f4c807c8b200';
      // property names and values
      addpropval = 'Temporary Placeholder';
      prop1name = 'taskstate';
      prop1value = null;
      prop2name = 'queue';
      prop2value = 42;
      prop3name = 'inuse';
      prop3value = true;
      prop4name = 'name';
      prop4value = 'life';
      prop5name = 'collection';
      prop5value = [ 'Got', 'to', 'love', 'book', 'references', -42, false ];
      // Expected objects to be read:
      // Entries
      entry1obj = {};
      entry1obj[ prop1name ] = prop1value;
      entry1obj[ prop2name ] = prop2value;
      entry1obj[ prop3name ] = prop3value;
      entry2obj = {};
      entry2obj[ prop1name ] = prop1value;
      entry2obj[ prop2name ] = prop2value;
      entry2obj[ prop3name ] = prop3value;
      entry2obj[ prop4name ] = prop4value;
      entry2obj[ prop5name ] = prop5value;
      // All entries array
      all1 = shallowObjectCopy( entry1obj );
      all1.uuid = entry1uuid;
      all2 = shallowObjectCopy( entry2obj );
      all2.uuid = entry2uuid;

      // Test cases
      it('Check if entry1 already exists (should not)', () => {
        expect( entrypartition.has( entry1uuid ) ).to.equal(false);
      });
      it('Create entry1', () => {
        expect( entrypartition.add( entry1uuid ) ).to.equal(true);
      });
      it('Check if entry1 already exists (should exist)', () => {
        expect( entrypartition.has( entry1uuid ) ).to.equal(true);
      });
      it('Create entry2', () => {
        expect( entrypartition.add( entry2uuid ) ).to.equal(true);
      });
      it('List entries', () => {
        let entries = [ entry1uuid, entry2uuid ];
        expect( compareArrays(entrypartition.listentries(), entries) ).to.equal(true);
      });
      it('Add property1 to entry1', () => {
        expect( entrypartition.addproperty(entry1uuid, prop1name, addpropval) ).to.equal(true);
      });
      it('Add property2 to entry1', () => {
        expect( entrypartition.addproperty(entry1uuid, prop2name, addpropval) ).to.equal(true);
      });
      it('Add property3 to entry1', () => {
        expect( entrypartition.addproperty(entry1uuid, prop3name, addpropval) ).to.equal(true);
      });
      it('Update property1 on entry1 with value1', () => {
        expect( entrypartition.updateproperty(entry1uuid, prop1name, prop1value) ).to.equal(true);
      });
      it('Update property2 on entry1 with value2', () => {
        expect( entrypartition.updateproperty(entry1uuid, prop2name, prop2value) ).to.equal(true);
      });
      it('Update property3 on entry1 with value3', () => {
        expect( entrypartition.updateproperty(entry1uuid, prop3name, prop3value) ).to.equal(true);
      });
      it('Add property1 to entry2', () => {
        expect( entrypartition.addproperty(entry2uuid, prop1name, addpropval) ).to.equal(true);
      });
      it('Add property2 to entry2', () => {
        expect( entrypartition.addproperty(entry2uuid, prop2name, addpropval) ).to.equal(true);
      });
      it('Add property3 to entry2', () => {
        expect( entrypartition.addproperty(entry2uuid, prop3name, addpropval) ).to.equal(true);
      });
      it('Add property4 to entry2', () => {
        expect( entrypartition.addproperty(entry2uuid, prop4name, addpropval) ).to.equal(true);
      });
      it('Add property5 to entry2', () => {
        expect( entrypartition.addproperty(entry2uuid, prop5name, addpropval) ).to.equal(true);
      });
      it('Update property1 on entry2 with value1', () => {
        expect( entrypartition.updateproperty(entry2uuid, prop1name, prop1value) ).to.equal(true);
      });
      it('Update property2 on entry2 with value2', () => {
        expect( entrypartition.updateproperty(entry2uuid, prop2name, prop2value) ).to.equal(true);
      });
      it('Update property3 on entry2 with value3', () => {
        expect( entrypartition.updateproperty(entry2uuid, prop3name, prop3value) ).to.equal(true);
      });
      it('Update property4 on entry2 with value4', () => {
        expect( entrypartition.updateproperty(entry2uuid, prop4name, prop4value) ).to.equal(true);
      });
      it('Update property5 on entry2 with value5', () => {
        expect( entrypartition.updateproperty(entry2uuid, prop5name, prop5value) ).to.equal(true);
      });
      it('Read entry1', () => {
        expect( compareObjects(entrypartition.read(entry1uuid), entry1obj) ).to.equal(true);
      });
      it('Read entry2', () => {
        expect( compareObjects(entrypartition.read(entry2uuid), entry2obj) ).to.equal(true);
      });
      it('List properties for entry1', () => {
        expect( compareArrays(entrypartition.listproperties(entry1uuid), Object.keys(entry1obj)) ).to.equal(true);
      });
      it('List properties for entry2', () => {
        expect( compareArrays(entrypartition.listproperties(entry2uuid), Object.keys(entry2obj)) ).to.equal(true);
      });
      it('Check for presence of property1 on entry1 (should find it)', () => {
        expect( entrypartition.hasproperty(entry1uuid, prop1name) ).to.equal(true);
      });
      it('Check for presence of property1 on entry1 (should not find it)', () => {
        expect( entrypartition.hasproperty(entry1uuid, prop5name) ).to.equal(false);
      });
      it('Read current value of property1 on entry1', () => {
        expect( entrypartition.readproperty(entry1uuid, prop1name) ).to.equal(prop1value);
      });
      it('Read current value of property2 on entry1', () => {
        expect( entrypartition.readproperty(entry1uuid, prop2name) ).to.equal(prop2value);
      });
      it('Read current value of property3 on entry1', () => {
        expect( entrypartition.readproperty(entry1uuid, prop3name) ).to.equal(prop3value);
      });
      it('Read current value of property1 on entry2', () => {
        expect( entrypartition.readproperty(entry2uuid, prop1name) ).to.equal(prop1value);
      });
      it('Read current value of property2 on entry2', () => {
        expect( entrypartition.readproperty(entry2uuid, prop2name) ).to.equal(prop2value);
      });
      it('Read current value of property3 on entry2', () => {
        expect( entrypartition.readproperty(entry2uuid, prop3name) ).to.equal(prop3value);
      });
      it('Read current value of property4 on entry2', () => {
        expect( entrypartition.readproperty(entry2uuid, prop4name) ).to.equal(prop4value);
      });
      it('Read current value of property5 on entry2 (Array value)', () => {
        expect( compareArrays(entrypartition.readproperty(entry2uuid, prop5name), prop5value) ).to.equal(true);
      });
      it('readAll() returns an array', () => {
        expect( entrypartition.readAll() instanceof Array ).to.equal(true);
      });
      it('readAll() return count.', () => {
        expect( entrypartition.readAll().length ).to.equal(2);
      });
      it('readAll() entry1 was returned in the format expected.', () => {
        let currobj;
        entrypartition.readAll().forEach(function findEntry( entry ) {
          if ( entry.uuid === entry1uuid ) {
            currobj = entry;
          }
        });
        expect( compareObjects(currobj, all1) ).to.equal(true);
      });
      it('readAll() entry2 was returned in the format expected.', () => {
        let currobj;
        entrypartition.readAll().forEach(function findEntry( entry ) {
          if ( entry.uuid === entry2uuid ) {
            currobj = entry;
          }
        });
        expect( compareObjects(currobj, all2) ).to.equal(true);
      });
      it('Remove property1 from entry1', () => {
        expect( entrypartition.removeproperty(entry1uuid,prop1name) ).to.equal(true);
      });
      it('Validate that property1 was removed from entry1', () => {
        let properties = [ prop2name, prop3name ];
        expect( compareArrays(entrypartition.listproperties(entry1uuid), properties) ).to.equal(true);
      });
      it('Remove entry1', () => {
        expect( entrypartition.remove(entry1uuid) ).to.equal(true);
      });
      it('Validate that entry1 has been removed', () => {
        let entries = [ entry2uuid ];
        expect( compareArrays(entrypartition.listentries(), entries) ).to.equal(true);
      });
      it('Attemp to remove non-existing entry (should return false)', () => {
        expect( entrypartition.remove(entry1uuid) ).to.equal(false);
      });
      it('Destroy current partition and clear object API', () => {
        expect( entrypartition.destroy() ).to.equal(true);
      });
      it('Validate that the API is no longer present', () => {
        expect( Object.keys(entrypartition).length ).to.equal(0);
      });
      it('Validate that the Partition is no longer present', () => {
        let partitionlist = [ MAIN_PARTITION_NAME ];
        expect( compareArrays(ctask.listpartitions(), partitionlist) ).to.equal(true);
      });
    });
    describe('Entry tests cleanup', () => {
      it('Validate entry tests partition has been destroyed.', () => {
        let partitionlist = [ MAIN_PARTITION_NAME ];
        ctask.listpartitions().forEach(function cleanup(partitionname) {
          if ( partitionname !== MAIN_PARTITION_NAME ) {
            ctask.destroypartition( partitionname );
          }
        });
        expect( compareArrays(ctask.listpartitions(), partitionlist) ).to.equal(true);
      });
    });
  });

  // Property level tests
  describe('#Property', () => {
    let propertypartition, entryuuid, entry_ref;
    entryuuid = 9854726934;
    describe('Property (on entry API) tests initialization', () => {
      it('Create partition for property tests.', () => {
        let partitionlist = [ MAIN_PARTITION_NAME, PROPERTY_PARTITION_NAME ];
        propertypartition = ctask.createpartition( PROPERTY_PARTITION_NAME );
        expect( compareArrays(ctask.listpartitions(), partitionlist) ).to.equal(true);
      });
      it('Validate the properties for partition reference returned.', () => {
        expect( compareArrays(Object.keys( propertypartition ), partAPIprops ) ).to.equal(true);
      });
      it('Create Entry reference for entry tests.', () => {
        let entrylist = [ String( entryuuid ) ];
        propertypartition.add( entryuuid );
        expect( compareArrays(propertypartition.listentries(), entrylist) ).to.equal(true);
      });
      it('Validate the properties for partition reference returned.', () => {
        entry_ref = propertypartition.getEntryReference( entryuuid );
        expect( compareArrays(Object.keys( entry_ref ), entryAPIprops ) ).to.equal(true);
      });
    });
    describe('Property (on entry API) tests', () => {
      let prop1name, prop1value, prop2name, prop2value, prop3name, prop3value,
        prop4name, prop4value, prop5name, prop5value;
      // Test property names and values
      prop1name = 'taskstate';
      prop1value = null;
      prop2name = 'queue';
      prop2value = 42;
      prop3name = 'inuse';
      prop3value = true;
      prop4name = 'name';
      prop4value = 'life';
      prop5name = 'collection';
      prop5value = [ 'Got', 'to', 'love', 'book', 'references', -42, false ];
      // Test cases
      it('.', () => {
        //expect(  ).to.equal(true);
      });
    });
    describe('Property (on entry API) tests cleanup', () => {
      it('Validate property tests partition has been destroyed.', () => {
        let partitionlist = [ MAIN_PARTITION_NAME ];
        ctask.listpartitions().forEach(function cleanup(partitionname) {
          if ( partitionname !== MAIN_PARTITION_NAME ) {
            ctask.destroypartition( partitionname );
          }
        });
        expect( compareArrays(ctask.listpartitions(), partitionlist) ).to.equal(true);
      });
    });
  });
})();