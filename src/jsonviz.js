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
	var StructureIndexer = function(obj, opts) {
		this.length = 0;
		this.index_obj = [];
		this.index_ary = {};
		this.non_obj_length = 0;
		this.options = _.extend({
			threshold: 0
		}, opts || {});
		this.createIndex(obj);
	};

	/**
	 * Index the object, only 1 level deep
	 */
	StructureIndexer.prototype.createIndex = function (obj) {
		var data;
		_.every(obj, function (o) {
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

				var data_len = data.length;
				if(data_len === 0) return true;

				var	data_len_thresh = data_len * (1 - this.options.threshold),
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
			} else {
				this.non_obj_length++;
				//no more index creation required
				return false;
			}

			if(this.length > 1000) return false;

			//ignore everything else
			return true;
		}, this);
	};

	/**
	 * Get eligible structures from the given object
	 * @param  float ratio_obj Range from 0.0 to 1.0, higher is more lenient
	 * @param  float ratio_ary Range from 0.0 to 1.0, higher is more lenient
	 * @return object           Eligible structs
	 */
	StructureIndexer.prototype.getEligible = function (ratio_obj, ratio_ary) {
		if(this.non_obj_length) return false;
		//min length of a datastrucure must be 5
		if(this.length < 5) return false;
		if(_.isUndefined(ratio_obj)) ratio_obj = 1;
		if(_.isUndefined(ratio_ary)) ratio_ary = 1;

		var threshold = ratio_obj * this.length,
			eligible;

		this.index_obj = _.sortBy(this.index_obj, function (o) {
			//sort the object index by count desc
			return -(o.count + o.data.length);
		});

		eligible = _.filter(this.index_obj, function (o) {
			//filter the index by threshold to find the eligible
			return (o.count >= threshold);
		});

		//return if eligible are found
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
						//map the array index to count 
						return (o >= threshold) ? k : -1;
					})
					.filter(function(v) {
						//filter the index by threshold to find the eligible
						return v >= 0;
					})
					.value();

		console.log('elig',eligible);

		//return if found
		if(!_.isEmpty(eligible)) {
			eligible = {
				data: eligible,
				type: 2
			};
			return eligible;
		}

		return false;
	};

	StructureIndexer.prototype.getIndex = function (type) {
		if(type === 1) { //object
			return this.index_obj;
		} else if(type === 2) { //array
			return this.index_ary;
		}
	};

	/**
	 * Singleton class to analyze objects using StructureIndexer
	 * @type {Object}
	 */
	var StructureAnalyzer = {
		analyze : function (object, levels, path) {
			if(_.isUndefined(levels)) levels = 1;

			return this._analyze(object, levels, path || '$');
		},
		_analyze : function (obj, levels, path) {

			var ds = new StructureIndexer(obj), //create index
				elig = ds.getEligible(4/7, 4/7), //filter from index
				is_ary = _.isArray(obj),
				tmp;
			// console.log(arguments, ds.getIndex(1), ds.getIndex(2));

			if(_.isUndefined(path)) path = "$"; //default jsonPath
			if(elig === false) { //if no eligible found, look deeper
				levels--;
				if(levels <= 0) { //make sure it's allowed
					return false;
				}

				elig = [];

				_.each(obj, function (o,k) { //call self for each child, maintining jsonPath
					tmp = this._analyze(o, levels, path + '[' + (is_ary ?  k  : "'" + k + "'") + ']');
					if(tmp !== false) {
						elig.push(tmp);
					}
				}, this);

				if(elig.length === 0) {
					elig = false;
				} else { //flatten the deep array due to recursion
					elig = _.flatten(elig);
				}
			} else { //found eligible
				var is_key_ary = (elig.type === 2);

				//maintain jsonPath
				// path += '.';
				path += (is_ary ? '[*]' : '.*');

				_.each(elig.data, function(s) {
					s.paths = _.map(s.data, function(v) {
						return path + (is_key_ary ? '' : '.' + v);
					});
				});

				elig.root_path = path;
			}
			return elig;
		}
	};

	//frequently used constants
	var jpPath = {"resultType":"PATH"}/*,
		jpValue = {"resultType":"VALUE"}*/;


	/**
	 * JSONViz
	 * @type {Object}
	 */
	var JSONViz = {
		_options:{},
		_templates:{
			htmlTable: {
				new_obj_vert_ds: _.template("<% if(!_.isEmpty(children)) { %><p class=\"muted hand\" onclick=\"$(this).next().toggle()\"><%= info1 %></p><table class=\"table table-bordered\"><%= children %></table><% } %>"),
				new_obj_vert: _.template("<% if(!_.isEmpty(children)) { %><tr><td class=\"span2\"><strong><abbr title=\"<%= path %>\"><%= info %></abbr></strong></td><%= children %></tr><% } %>"),
				new_obj_horz: _.template("<p class=\"muted hand\" onclick=\"$(this).next().toggle()\"><%= info1 %></p><% if(!_.isEmpty(children)) { %><table class=\"table table-bordered\"><%= children %></table><% } %>"),
				new_property_horz: _.template("<tr><td class=\"span1\"><strong><abbr title=\"<%= path %>\"><%= info %></abbr></strong></td><td class=\"span11\" <%= attr %>><%= value %></td></tr>"),
				new_property_vert: _.template("<td><%= value %></td>"),
				headers_vert: _.template("<tr><% _.each(headers, function(v) { %><th><%= v %></th><% }); %></tr>")
			}
		},
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
		},
		setOptions: function (opts) {
			this._options = _.extend(this._options, opts || {});
			this._options.analyze = !_.isUndefined(this._options.headers) && this._options.headers === "auto" ? true : false;
			return;
		},
		render: function (path, type) {
			var root = this._parsed;
			if(!_.isUndefined(path) && path !== "$") {
				root = jsonPath(root, path);
				if(_.isArray(root) && root.length === 1) {
					root = root[0];
				}
			} else {
				path = "$";
			}
			var result;

			switch(type) {
				case 'htmlTable':
					result = this._htmlTableRender(root, path);
					break;
				default:
				case 'simpleText':
					result = this._simpleTextRender(root, path, "");
					break;
			}
			// console.log("Final:",result);
			this._renderOutput = result;
			return result;
		},
		initTemplates: function() {
			// this._templates = ;
		},
		_htmlTableRender: function (root, path, key, is_ds, headers) {
			var	out = [],
				renderData = {info:"",path:path,attr:''},
				args = arguments;

			if(!_.isUndefined(key)) {
				renderData.info = key;
			}
			if(_.isUndefined(is_ds)) {
				is_ds = 0;
			}

			if(_.isObject(root)) {
				var is_ary = _.isArray(root),
					p_prefix = path + "[" + (!is_ary ? "'" : ""),
					p_suffix = (!is_ary ? "'" : "") + "]",
					count = 0,
					child_is_ds = 0,
					child_keys = [],
					child_keys_union = [];

				if(this._options.analyze) {
					var structures = StructureAnalyzer.analyze(root, 1, path);

					if(!_.isArray(structures)) structures = [structures];

					if(!_.isEmpty(structures) && structures[0] !== false) {
						console.log("DS found:",structures, root);
						child_is_ds = 2;
						var child_headers = [];
						_.every(structures, function(s) {
							if(_.isArray(s.data) && !_.isObject(s.data[0])) {
								child_headers = _.range(s.data);
								console.log("Header array:", child_headers);
								return false;
							} else {
								child_headers = s.data[0].data;
								console.log("Header obj:", child_headers);
								return false;
							}
						}, this);
						out.push(this._templates.htmlTable.headers_vert({headers:_.union(['key'],child_headers)}));
					}
				}

				if(child_is_ds === 0 && is_ds !== 0) {
					child_is_ds = is_ds - 1;
				}

				if(child_is_ds == 1) {
					if((is_ary && headers.length !== root.length)) {
						child_is_ds = 0;
						console.log("Force child no DS", "ARRAY", root, headers);
					} else if(!is_ary) {
						var keys = _.keys(root),
							intersection = _.intersection(keys, headers);

						if(intersection.length !== headers.length) {
							child_is_ds = 0;
							is_ds = 0;
							console.log("Force child no DS", "OBJ", root, headers);
						}
					}
				}

				_.each(root, function (value, key) {
					// if(!_.isArray(value) && _.isObject(value)) {
					// 	child_keys = _.keys(value);
					// 	child_keys_union = _.union(child_keys, child_headers).length;
					// 	if((child_keys.length === child_keys_union && child_headers.length === child_keys_union))
					// }
					out.push(this._htmlTableRender(value, p_prefix + key + p_suffix, key, child_is_ds, child_headers));
					count++;
				}, this);
				renderData.children = out.join('');
				out = [];
				renderData.info1 = (is_ary ? "Array" : "Object") + "[" + count + "]" + (this._options["showPath"] ? " @ " + path : "");
				// console.log(renderData);
				if(is_ds > 0) {
					if(child_is_ds === 2 || is_ds === 1) {
						out.push(this._templates.htmlTable.new_obj_vert_ds(renderData));
					} else {
						out.push(this._templates.htmlTable.new_obj_vert(renderData));
					}
				} else {
					out.push(this._templates.htmlTable.new_obj_horz(renderData));
				}

				//if a key is defined, render as a property
				if(!_.isUndefined(key)) {
					renderData.value = out.join('');
					if(is_ds) {
						if(is_ds == 1) {
							out = [];
							out.push(this._templates.htmlTable.new_property_vert(renderData));
						}
					} else {
						if(headers && !is_ary) {
							renderData.attr = 'colspan="' + headers.length + '"';
						}
						out = [];
						out.push(this._templates.htmlTable.new_property_horz(renderData));
					}
				}
			} else {
				renderData.info += (this._options["showPath"] ? " @ " + path : "");
				renderData.value = root + "";
				if(is_ds) {
					out.push(this._templates.htmlTable.new_property_vert(renderData));
				} else {
					out.push(this._templates.htmlTable.new_property_horz(renderData));
				}
			}

			return out.join('');
		},
		_simpleTextRender: function (root, path, prefix, key) {
			var	out = "";

			if(_.isObject(root)) {
				var is_ary = _.isArray(root),
					p_prefix = path + "[" + (!is_ary ? "'" : ""),
					p_suffix = (!is_ary ? "'" : "") + "]",
					count = 0,
					child_prefix = prefix + "\t";

				if(this._options.analyze) {
					var structures = StructureAnalyzer.analyze(root);

					if(!_.isArray(structures)) structures = [structures];

					console.log("DS found:",structures, root);
				}

				_.each(root, function (v, k) {
					out += this._simpleTextRender(v, p_prefix + k + p_suffix, child_prefix, k);
					count++;
				}, this);

				if(!_.isUndefined(key)) prefix += key + " @ ";
				if(is_ary) {
					out = prefix + "Array[" + count + "]" + (this._options["showPath"] ? " @ " + path : "") + "\n" + out;
				} else {
					out = prefix + "Object[" + count + "]" + (this._options["showPath"] ? " @ " + path : "") + "\n" + out;
				}

			} else {
				if(!_.isUndefined(key)) prefix += key + " @ ";
				if(_.isFunction(root)) {
					out = prefix + "Function = " + root + "" + (this._options["showPath"] ? " @ " + path : "");
				} else {
					out = prefix + "Value = " + root + "" + (this._options["showPath"] ? " @ " + path : "");
				}
				out += "\n";
			}

			return out;
		},
		_jpRender: function (path, prefix) {
			if(_.isUndefined(path)) path="$";
			if(_.isUndefined(prefix)) prefix="";

			var root = this._parsed;
			if(path !== "$") {
				root = jsonPath(this._parsed, path);
				if(_.isArray(root) && root.length === 1) {
					root = root[0];
				}
			}

			var	paths = jsonPath(root, '$.*', jpPath),
				out;

			// if(root === false)  throw new Error("Root is empty");
			// else console.log(root);

			if(paths !== false) {
				if(_.isArray(root)) {
					// console.log("Array", root, paths);
					out = prefix + "Array[" + paths.length + "]";
				} else if(_.isObject(root)) {
					// console.log("Object", root, paths);
					out = prefix + "Object[" + paths.length + "]";
				}
				out += "\n";
				_.each(paths, function (p) {
					out += this._jpRender(path + p.substring(1), prefix + "\t");
				}, this);
			} else {
				if(_.isFunction(root)) {
					// console.log("Function", root, paths);
					out = prefix + "Function = " + root;
				} else {
					// console.log("Value", root, paths);
					out = prefix + "Value = " + root;
				}
				out += "\n";
			}
			// console.log(out);
			return out;
		}

	};

	//bind JSONViz to window
	w["JSONViz"] = JSONViz;
}(window));