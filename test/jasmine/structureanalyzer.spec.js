'use strict';

/* jasmine specs for services go here */

describe("StructureAnalyzer", function() {
	var StructureAnalyzer;
	var tmp, tmp1;

	beforeEach(function () {
		StructureAnalyzer = JSONViz.getModule('StructureAnalyzer');
	});

	afterEach(function () {
		tmp = null;
		tmp1 = null;
	});

	it("exists as on object", function() {
		expect(StructureAnalyzer).toBe(Object(StructureAnalyzer));
	});

	describe("jpDenormalize", function () {
		// beforeEach(function () {
		// 	tmp = new StructureAnalyzer(deep_clone(data_simple_table_4));
		// });
		function jpDenormalizeTest(paths) {
			_.each(paths, function (v) {
				var path = v
				path = StructureAnalyzer.jpNormalize(path);
				path = StructureAnalyzer.jpDenormalize(path);
				expect(path).toBe(v);
			});
		}

		it("works on simple paths set 1", function() {
			jpDenormalizeTest(data_simple_paths_set_1);
		});

		it("works on simple paths set 2", function() {
			jpDenormalizeTest(data_simple_paths_set_2);
		});

		it("works on simple paths set 3", function() {
			jpDenormalizeTest(data_simple_paths_set_3);
		});
	});

	/*describe("on a simple table of size 10", function () {
		beforeEach(function () {
			tmp = new StructureAnalyzer(deep_clone(data_simple_table_10));
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
			expect(tmp1.data[0].data).toEqual(data_simple_table_10_ds);
		});
	});*/
});