'use strict';

/* jasmine specs for services go here */

describe("StructureIndexer", function() {
	var StructureIndexer;
	var tmp, tmp1;

	beforeEach(function () {
		StructureIndexer = JSONViz.getModule('StructureIndexer');
	});

	afterEach(function () {
		tmp = null;
		tmp1 = null;
	});

	it("exists as on object", function() {
		expect(StructureIndexer).toBe(Object(StructureIndexer));
	});

	describe("on a simple table of size 4", function () {
		beforeEach(function () {
			tmp = new StructureIndexer(deep_clone(data_simple_table_4));
		});

		it("has the correct length", function() {
			expect(tmp.length).toBe(4);
		});

		it("found no data structure, due to the min length", function() {
			tmp1 = tmp.getEligible();
			expect(tmp1).toBe(false);
		});
	});

	describe("on a simple table of size 10", function () {
		beforeEach(function () {
			tmp = new StructureIndexer(deep_clone(data_simple_table_10));
		});

		it("has the correct length", function() {
			expect(tmp.length).toBe(10);
		});

		it("found the correct type of data structure", function() {
			tmp1 = tmp.getEligible();
			expect(tmp1.type).toBe(1);
		});

		it("found the correct data structure", function() {
			tmp1 = tmp.getEligible();
			//use a weak equality, unline toBe
			expect(
					_.isEqual(tmp1.data[0].data, data_simple_table_10_ds)
				).toBe(true);
		});
	});
});