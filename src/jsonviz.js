
/*
 * JSONViz
 * @author Prakhar  Birla
 * @uses underscore.js
 * @url https://github.com/birla/jsonviz
 */

(function (w) {
	'use strict';


	/**
	 * Helper to detect data structures in objects and arrays.
	 * For objects, data structures means that keys must match, while
	 * for arrays only the length of the array must match.
	 * 
	 * @author Prakhar  Birla
	 * @param  Object/Array obj   Item to scan for data structures
	 * @return instanceof self
	 */
	var Structure = function(obj, opts) {
		this.length = 0;
		this.index_obj = [];
		this.index_ary = {};
		this.options = _.extend({
			threshold: 0
		}, opts || {});
		this.createIndex(obj);
	};

	/**
	 * Index the object, only 1 level deep
	 */
	Structure.prototype.createIndex = function (obj) {
		var data;
		_.each(obj, function (o) {
			/*
				Index arrays and objects in a different way because
				object can have named keys while array key can only be
				numeric
			 */
			if(_.isArray(o)) {
				data = o.length;
				//index_ary is a object representing length -> count
				//where length the simply the length of the array
				if(_.has(this.index_ary, data)) {
					this.index_ary[data]++;
				} else {
					this.index_ary[data] = 1;
				}
				this.length++;
			} else
			if(_.isObject(o)) {
				//get only the keys
				data = _.keys(o);

				var data_len = data.length,
					data_len_thresh = data_len * (1 - this.options.threshold),
					diff, exact_match = false;

				//get a list of matching indexes sorted by their match with data i.e. object's keys 
				diff = _.chain(this.index_obj)
						.filter(function(s) {
							diff = _.intersection(data, s.data).length;
							if(diff >= data_len_thresh) {
								s.match = diff;
								return true;
							}
							return false;
						}, this)
						.sortBy(function (s) {
							return -s.match;
						})
						.value();
				//for max 2 of length of matches, increase the score
				data_len_thresh = (diff.length > 2 ? 2 : diff.length);
				for (var i = 0; i < data_len_thresh; i++) {
					if(diff[i].match === data_len) {
						diff[i].count++;
						exact_match = true;
					} else {
						diff[i].count += 0.25;
					}
				}
				// _.every(this.index_obj, function(s) {
				// 	diff = _.difference(s.data, data);
				// 	if(diff.length === 0) {
				// 		s.count++;
				// 		exact_match = true;
				// 	} else if(diff.length <= data_len_thresh) {
				// 		s.count += 0.25;
				// 	}
				// 	return true;
				// });
				if(exact_match !== true) { //new struct, add to index
					this.index_obj.push({
						data: data,
						count: 1,
						match: data_len
					});
				}
				this.length++;
			}
			//ignore everything else
		}, this);
	};

	/**
	 * Get eligible structures from the given object
	 * @param  float ratio_obj Range from 0.0 to 1.0, higher is more lenient
	 * @param  float ratio_ary Range from 0.0 to 1.0, higher is more lenient
	 * @return object           Eligible structs
	 */
	Structure.prototype.getEligible = function (ratio_obj, ratio_ary) {
		//min length of a datastrucure must be 5
		if(this.length < 5) return false;
		if(_.isUndefined(ratio_obj)) ratio_obj = 1;
		if(_.isUndefined(ratio_ary)) ratio_ary = 1;
		var threshold = ratio_obj * this.length, eligible;
		this.index_obj = _.sortBy(this.index_obj, function (o) {
			return -(o.count + o.data.length);
		});
		eligible = _.filter(this.index_obj, function (o) {
			return (o.count >= threshold);
		});
		if(!_.isEmpty(eligible)) {
			eligible = {
				data: eligible,
				type: 1
			};
			return eligible;
		}

		threshold = ratio_ary * this.length;

		eligible = _.chain(this.index_ary)
					.map(function (o, k) {
						console.log("o:thres:k",o, threshold, k);
						return (o >= threshold) ? k : -1;
					})
					.filter(function(v) {
						return v >= 0;
					})
					.value();

		console.log('elig',eligible);
		// eligible = _.filter(this.index_ary, function (o) {
		// 	return (o >= threshold);
		// });

		if(!_.isEmpty(eligible)) {
			eligible = {
				data: eligible,
				type: 2
			};
			return eligible;
		}

		console.log(null);

		return false;
	};

	Structure.prototype.getIndex = function (type) {
		if(type === 1) { //object
			return this.index_obj;
		} else if(type === 2) { //array
			return this.index_ary;
		}
	};

	var StructureFactory = function (root) {
		this.root = root;
	};

	StructureFactory.prototype.analyze = function (levels, alt_start_path) {
		var start = this.root;

		// do {
		// 	if(_.isUndefined(alt_start_path)) break;

		// 	start = jsonPath(start, )
		// }

		return this._analyze(start, levels, '$');
	};

	StructureFactory.prototype._analyze = function (obj, levels, path) {
			var ds = new Structure(obj);
			var elig = ds.getEligible(4/7, 4/7);
			console.log(arguments, ds.getIndex(1), ds.getIndex(2));
			var tmp, is_ary = _.isArray(obj);
			if(_.isUndefined(path)) path = "$";
			if(elig === false) {
				levels--;
				if(levels <= 0) {
					return false;
				}
				elig = [];

				_.each(obj, function (o,k) {
					tmp = this._analyze(o, levels, path + (is_ary ? '[' + k + ']' : '.' + k));
					if(tmp !== false) {
						elig.push(tmp);
					}
				}, this);
				if(elig.length === 0) {
					elig = false;
				} else {
					elig = _.flatten(elig);
				}
			} else {
				var is_key_ary = (elig.type === 2);
				path += '.';
				// path += (is_ary ? '[*]' : '.*');
				_.each(elig.data, function(s) {
					console.log("s$",s);
					s.paths = _.map(s.data, function(v) {
						return path + (is_key_ary ? '' : '.' + v);
					});
				});
				elig.root_path = path;
				console.log(elig);
				// var paths = _.map(elig.data, function (k) {
				// 	return path + (is_ary ? '[*]' : '.*') + (is_key_ary ? '' : '.' + k);
				// });
				// elig.paths = paths;

			}
			return elig;
		};

	w.JSONViz = {
		_options:{},
		parse: function (json_string) {
			//TODO: add validator
			// console.log('Input data:', json_string);
			this._parsed = undefined;
			try {
				this._parsed = JSON.parse(json_string);
			} catch (e) {
				if(e instanceof SyntaxError) {
					console.error("Syntax error in input JSON");
					return;
				} else {
					throw e;
				}
			}


			// var structures = this.getDataStructures(this._parsed, 3);
			var structF = new StructureFactory(this._parsed),
				structures = structF.analyze(3);
			if(!_.isArray(structures)) structures = [structures];

			console.log("DS found:",structures);
			_.each(structures, function(s) {
				_.each(s.data, function (q) {
					_.each(q.paths, function (p) {
						console.log("Path:", p, "Values:", jsonPath(this._parsed, p));
					}, this);
				}, this);
			}, this);
		},
		setOptions: function (opts) {
			
		}

	};
}(window));