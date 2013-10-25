
// $('button').tooltip({
// 	title: 'Tesst',
// 	placement: 'right'
// });

$('#headers_btn').click(function() {
	setTimeout( function() {
		$('#headers_btn button').each(function(i, b) {
			b = $(b);
			if(b.hasClass('active')) {
				b = b.html().toLowerCase();
				JSONViz.setOptions({headers:b});
			}
		});
	},0);
});

$('#viz_btn').click(function() {
	$('abbr') && $('abbr').off();
	JSONViz.parse($('#raw_json').val());
	if(JSONViz._options.fixed) {
		$('#row_out').html(
			JSONViz.fixedHeaders(
				JSON.parse($('#json_headers').val())
			)
		);
	} else {
		$('#row_out').html(JSONViz.render('$', 'htmlTable'));
		$('abbr')
			.on('mouseenter', _.debounce(function mouseenter (e) {
				JVClipboard.set($(e.target).attr('title'));
			}, 70))
			.on('mouseleave', _.debounce(function mouseleave (e) {
				JVClipboard.set('');
			}, 70, true));
	}
	
	// 
});