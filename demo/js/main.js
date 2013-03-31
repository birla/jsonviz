
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
	JSONViz.parse($('#raw_json').val());
	if(JSONViz._options.fixed) {
		$('#row_out').html(
			JSONViz.renderUsingHeaders(
				JSON.parse($('#json_headers').val())
			)
		);
	} else {
		$('#row_out').html(JSONViz.render('$', 'htmlTable'));
	}
	
	// 
});