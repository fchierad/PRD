// Mocha tests for ctask
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
  const MAIN_PARTITION_NAME = 'ctask_main_partition';
  const TEMP_PARTITION_NAME = 'test partition';
  const ENTRY_PARTITION_NAME = 'entrytests';
  const PROPERTY_PARTITION_NAME = 'propertytests';

  describe('Module loaded', () => {
    it('Module loaded as globalScope.ctask', () => {
      expect(ctask === void 0).to.equal(false);
    });
  });

  // Partition level tests
  describe('Partition tests', () => {
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
  // Property level tests
})();