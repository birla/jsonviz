
// $('button').tooltip({
// 	title: 'Tesst',
// 	placement: 'right'
// });


$(document).ready(function() {
	var downloadButton;
	var jvHeaderType;
	var headerHtmlTemplates;
	var clickSelectedColour = '#c6e34b';
	var clickSelectedHeaders = [];
	var outputType = 'html';
	var outputMapping = {
		'html' : {'file_name':'jsonviz.html', 'param': 'htmlTable'},
		'json' : {'file_name':'jsonviz.json', 'param': 'jsonString'},
		'jsonpath' : {'file_name':'jsonviz.html', 'param': 'jsonPath'},
		'csv' : {'file_name':'jsonviz.csv', 'param': 'csv'},
		'text' : {'file_name':'jsonviz.txt', 'param': 'simpleText'}
	};
	var localStorageCheck;
	var sampleData = {
		1: 'abs'
	};
	var StructureAnalyzer = JSONViz.getModule('StructureAnalyzer');

	localStorageCheck = (localStorage && true);

	$('#headers_btn').click(function() {
		if(localStorageCheck) {
			localStorage.removeItem('last_result');
		}
		setTimeout( function() {
			var found = false;
			$('#headers_btn button').each(function(i, b) {
				b = $(b);
				if(b.hasClass('active')) {
					if(b.hasClass('disabled')) {
						b.removeClass('active');
						return;
					}
					b = b.data('set');
					if(b == 'auto') {
						$('#headers_row').hide();
						if(!$('#output_csv_btn').hasClass('disabled')) {
							if($('#output_csv_btn').hasClass('active')) {
								$('#output_html_btn').addClass('active');
							}
							$('#output_csv_btn').addClass('disabled').removeClass('active');
						}
					} else {
						$('#output_csv_btn').removeClass('disabled');
						$('#headers_row').show();
					}
					jvHeaderType = b;
					JSONViz.setOptions({headers:b});
					$('#output_btn').click();
					return found=true;
				}
			});
			if(!found) {
				alert('Invalid selection.');
			}
		},0);
	}).click();

	$('#output_btn button').tooltip({placement:'bottom'});

	$('#output_btn').click(function() {
		if(localStorageCheck) {
			localStorage.removeItem('last_result');
		}
		setTimeout( function() {
			var found = false;
			$('#output_btn button').each(function(i, b) {
				var downloadVerdict = false;
				b = $(b);
				if(b.hasClass('active')) {
					if(b.hasClass('disabled')) {
						b.removeClass('active');
						return;
					}
					b = b.html().toLowerCase();

					if(jvHeaderType === 'auto') {
						if(b === 'json') downloadVerdict = true;
					} else {
						if(b !== 'html') downloadVerdict = true;
					}

					if(downloadButton) {
						if(downloadVerdict) {
							downloadButton.show();
						} else {
							downloadButton.hide();
						}
					}
					outputType = b;
					return found=true;
				}
			});
			if(!found) {
				alert('Invalid selection.');
			}
		},0);
	}).click();

	headerHtmlTemplates = {
		layout: _.template("<div class=\"controls controls-row\"> <span class=\"span2\">Root path  <i title=\"Root path is the common path amongst all the columns. Assume each result of this as `$` in the column paths.\" class=\"icon-question-sign\" id=\"root_path_tip\"></i></span>"+
				" <input type=\"text\" id=\"root_path\" class=\"span6\" placeholder=\"root path\" <% if(!_.isEmpty(path)) { %>value=\"<%= path %>\"<% } %> > "+
				" <span class=\"span2\"><button id=\"auto_root_btn\" class=\"btn btn-info btn-mini\" >Auto</button></span> </div>"+
				"<label><strong>Columns</strong></label><div id=\"header_columns_container\"></div>" +
				"<div class=\"controls\"> <i class=\"icon-plus-sign hand\"></i> </div>"),
		column_row: _.template("<div class=\"controls controls-row\"><input type=\"text\" class=\"span2\" <% if(name && !_.isEmpty(name)) { %>value=\"<%= name %>\"<% } %> name=\"columns_name[]\" placeholder=\"name\"><input type=\"text\" class=\"span5\" "+
				"<% if(path && !_.isEmpty(path)) { %>value=\"<%= path %>\"<% } %> name=\"columns_path[]\" placeholder=\"path\"><span class=\"span1\"><i class=\"icon-remove-sign hand\"></i></span></div>")
	};

	$('#header_display_toggle_btn').click(function headerDisplayToggleHandler (event) {
		var json_headers = getHeadersFromForm();
		if(localStorageCheck) {
			localStorage.removeItem('last_result');
		}
		setTimeout(function () {
			var target = $('#header_display_toggle_btn');
			var container = $('#headers_container');
			if(target.hasClass('active')) {
				container.find('div.controls i').off();
				container.empty().html('<textarea id="json_headers" rows="10" columns="50" class="span12"></textarea>');
				// dump a pretty json into the textarea
				$('#json_headers').val(JSON.stringify(json_headers, null, '    '));
			} else {
				var rows_container;
				container.empty().html(headerHtmlTemplates.layout({
					path: (json_headers.root ? json_headers.root : "$")
				}));

				rows_container = container.find('#header_columns_container');

				// fill in the rows based on json data
				if(!_.isEmpty(json_headers.columns)) {
					_.each(json_headers.columns, function columnTraversal (path, name) {
						rows_container.append($(headerHtmlTemplates.column_row({
							path: (path ? path : "$"),
							name: name
						})));
					});
				} else {
					rows_container.append($(headerHtmlTemplates.column_row({
						path: ''
					})));
				}

				container.find('#root_path_tip').tooltip();

				container.find('#auto_root_btn').click(function () {
					// get current headers
					var json_headers_current = getHeadersFromForm();
					// convert to internal format
					json_headers_current = wrapHeadersForJV(json_headers_current);
					var only_paths = _.values(json_headers_current.cols);
					var only_names = _.keys(json_headers_current.cols);
					// find the LCS at first star
					var lcs = StructureAnalyzer.jpLCS(only_paths);
					var json_headers_new = {
						root: false,
						columns: {}
					};

					// if LCS is found, update the values in the form
					if(_.isArray(lcs.lcs)) {
						json_headers_new.columns = _.object(only_names,_.map(lcs.left, function(value) {
							return StructureAnalyzer.jpDenormalize(value, true);
						}));
						json_headers_new.root = StructureAnalyzer.jpDenormalize(lcs.lcs, true);
						if(json_headers_new.root !== false) {
							rows_container.find('.controls-row').each(function domColumnTraverse (key, row) {
								var name = $(row).find('[name="columns_name[]"]').val();
								$(row).find('[name="columns_path[]"]').val(json_headers_new.columns[name]);
							});
							container.find('#root_path').val(json_headers_new.root);
						}
					} else {
						alert('Couldn\'t find the LCS.');
					}
				});

				// bind to the add column button
				container.find('div.controls i.icon-plus-sign').click(function (event) {
					rows_container.append($(headerHtmlTemplates.column_row({
						path: ''
					})));
					container.find('div.controls i.icon-remove-sign').last().click(removeHandler);
				});

				function removeHandler (event) {
					$(event.target).parent().parent().remove();
				}
				// bind to the remove column buttons
				container.find('div.controls i.icon-remove-sign').click(removeHandler);
			}
		},0);
	}).click();

	function getHeadersFromForm () {
		var container = $('#headers_container');
		var json_headers = {};
		if(!$('#header_display_toggle_btn').hasClass('active')) {
			var names = _.map(container.find('[name="columns_name[]"]'), function nameMap (ele) {
				return $(ele).val();
			});
			var paths = _.map(container.find('[name="columns_path[]"]'), function pathMap (ele) {
				return $(ele).val();
			});
			json_headers.root = container.find('#root_path').val();
			json_headers.columns = {};
			_.each(names, function nameTraversal(name, key) {
				json_headers.columns[name] = paths[key];
			});
		} else {
			json_headers = $('#json_headers').val();
			if(json_headers && json_headers.length > 0) {
				try {
					json_headers = JSON.parse(json_headers);
				} catch (e) {
					if(e instanceof SyntaxError) {
						alert("There is a SyntaxError in the headers.\nFix it to continue.");
					}
					throw e;
				}
			} else {
				json_headers = {};
			}
		}
		return json_headers;
	}

	// $('#header_display_toggle_btn').click(function headerDisplayToggleHandler () {
	// 	console.log('headerDisplayToggleHandler', arguments);
	// });

	$('#undo_btn').click(function undoButtonHandler () {
		var value;
		if(!localStorageCheck) {
			alert('Sorry, this functionality is not compatible with your browser!');
			return;
		}
		localStorage.removeItem('last_result');
		value = localStorage.getItem('input_as_array_undo');
		if(_.isEmpty(value)) {
			alert('Sorry, historical information is not available.')
		}
		$('#raw_json').val(value);
		$('#undo_btn').hide();
	});

	function wrapHeadersForJV(headers) {
		var root_path = headers.root ? headers.root : '$';
		var headers_final = {cols:{}};
		_.each(headers.columns, function headerTraversal(value, name) {
			headers_final.cols[name] = root_path + value.substr(1);
		});
		return headers_final;
	}

	$('#viz_btn').click(function() {
	    modalScreen.show();
		$('abbr') && $('abbr').parent().off();

		// defer so that the modal shows first
		setTimeout(function () {
			var input = $('#raw_json').val();
			var input_as_array_toggle_btn = $('#input_as_array_toggle_btn');
			var result;
			var headers;
			var root_path;
			var output_param;

			if(localStorageCheck) localStorage.removeItem('input_as_array_undo');
			if(input_as_array_toggle_btn.hasClass('active')) {
				var outArray = input.split(/\n|\r/);
				if(outArray.length > 0) {
					outArray = _.filter(outArray, function emptyFilter (value) {
						return value.length > 0;
					});
					if(localStorageCheck) {
						localStorage.setItem('input_as_array_undo', input);
						$('#undo_btn').show();
					}
					input = '[' + outArray.join(",\n") + ']';
					$('#raw_json').val(input);
					input_as_array_toggle_btn.removeClass('active');
					alert("Input was converted into an array & the button has been toggled." + 
						(localStorageCheck ? "\nTip: You can undo the conversion." : "") );
				}
			}

			try {
				JSONViz.parse(input);
			} catch (e) {
				if(e instanceof SyntaxError) {
					alert("There is a SyntaxError in the input.\nFix it to continue.");
				}
				modalScreen.hide();
				throw e;
			}

			if(JSONViz._options.fixed) {
				headers = wrapHeadersForJV(getHeadersFromForm());
			}

			try {
				result = JSONViz.render('$', outputMapping[outputType]['param'], headers);
			} catch (e) {
				alert("Faced error while trying to render. See console for details.\nFix it to continue.");
				modalScreen.hide();
				throw e;
			}

			if(localStorageCheck) {
				localStorage.setItem('last_result', result);
			}

			if(outputType === 'html') {
				$('#row_out').html(result);
			} else {
				$('#row_out').html('<textarea rows="20" columns="50" class="span12" id="jv_out">' + result + '</textarea>');
			}

			$('abbr').parent()
				// Trello clipboard tool i.e. Ctrl+c on Hover
				.on('mouseenter', function mouseenter (e) {
					JVClipboard.set($(e.target).attr('title'));
				})
				.on('mouseleave', function mouseleave (e) {
					JVClipboard.set('');
				})
				// Click handler
				.on('click', function toggleHeaderSelect () {
					console.log('toggleHeaderSelect', arguments);
				});
			modalScreen.hide();
		}, 500);
	});

	JSONViz.setOptions({
		renderType: 'htmlTable',
		headers: 'auto'
	});

	downloadButton = $('#down_btn').downloadify({
		filename: function(){
			return outputMapping[outputType]['file_name'];
		},
		data: function(){
			if(localStorageCheck && localStorage.getItem('last_result')) {
				return localStorage.getItem('last_result');
			}
			alert('Unable to get data to download. Please click on the Visualize button again.')
			return;
		},
		onComplete: function(){ 
			alert('The file has been saved!'); 
		},
		onCancel: function(){ 
			alert('You have cancelled the saving of the file.');
		},
		onError: function(){ 
			alert('There was an error in downloading the file!'); 
		},
		swf: 'js/jsonviz/lib/media/downloadify.swf',
		downloadImage: 'img/download.png',
		width: 100,
		height: 30,
		transparent: true,
		append: false
	});

	$('.bind-tooltip').tooltip();
});