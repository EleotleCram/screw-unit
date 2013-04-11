(function($) {
  $(Screw)
    .bind('loaded', function() {    
      $('div.describe>h3, .describe>h1, .it>h2')
        .click(function() {
          document.location = location.href.split('?')[0] + '?' + $(this).parent().fn('selector');
          return false;
        })
	  $('div.describe>h3')
	    .attr('title', 'Run all tests');
      $('.describe>h1')
		.attr('title', 'Run only this group of tests');
      $('.it>h2')
		.attr('title', 'Run this test only')
      $('.describe, .it')
        .focus(function() {
          return $(this).addClass('focused');
        })
        .bind('scroll', function() {
          document.body.scrollTop = $(this).offset().top;
        });

      $('.it')
        .bind('enqueued', function() {
          $(this).addClass('enqueued');
        })
        .bind('running', function() {
          $(this).addClass('running');
        })
        .bind('passed', function() {
          $(this).addClass('passed');
        })
        .bind('failed', function(e, reason) {
          $(this)
            .addClass('failed');

			var errorElQ = $('<p class="error">');

			errorElQ.html(errorElQ.text(reason.toString()).html()
				.replace(/\x02/g, "<b>")
				.replace(/\x03/g, "</b>")
				.replace(/\n/g, "<br/>")
				.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;")
			);

			$(this).append(errorElQ);

		    if(reason.stack) {
			  var stack = StackTrace.getStackTrace(reason.stack).filter(function filterOutNativeCalls(elt) {return !elt.fileName || !elt.fileName.match(/\(native\)/)});
			  var file = stack[0].fileName;
			  var line = stack[0].lineNumber;

              $(this)
	  			.append($('<p class="error">').text('line ' + line + ', ' + file))
				.find('.error')
				  .click(function() {
	  			      TestingFrameworkUtil.gotoFileNameAndLineNum(file, line);
	  			      return false;
	  			    });

			  if(reason.type != 'AssertionException') {
				var stackTracePanel = $(
				  '<div class="stackTrace">\
				    <p class="showHideStackTrace">('+stack.length+' more...)</p>\
					<div class="stackTraceContents" style="display: none"></div>\
				  </div>'
				);
				$(this).append(stackTracePanel);

				var stackTraceContentsPanel = $(stackTracePanel).find('>.stackTraceContents');
				$(stackTracePanel).find('>.showHideStackTrace')
				  .attr('title', 'Click to expand')
				  .css('cursor', 'pointer')
				  .click(function() {
					stackTraceContentsPanel.slideToggle();
				});
				// We skip the first entry, because that one is always showing...
				stack.slice(1).forEach(function(stackEntry) {
				  var file = stackEntry.fileName;
				  var line = stackEntry.lineNumber;
				  if(file) {
				    stackTraceContentsPanel
					  .append(
					    $('<p class="error">')
					      .text('line ' + line + ', ' + file)
						  .click(function() {
						    TestingFrameworkUtil.gotoFileNameAndLineNum(file, line);
						    return false;
						  })
					  );
				  }
				});
			  }

			  $(this).find('.error')
				.attr('title', 'Click to jump to this error in NetBeans')
				.css('cursor', 'pointer');
            }
        })
    })
    .bind('before', function() {
      $('.status').text('Running...');
    })
    .bind('after', function() {
      $('.status').fn('display');
      $('div.describe>h3, .describe>h1, .it>h2')
        .each(function() {
          var text = $(this).text();
            var uri = location.href.split('?')[0] + '?screwunitSubset=' + $(this).parent().fn('selector');
            $(this).html('<a href="'+uri+'">'+text+'</a>');
        });
    })
})(jQuery);