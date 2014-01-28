(function($) {
  $(Screw).bind('loaded', function() {
    $('.status').fn({
      display: function() {
        $(this).text(
          $('.passed').length + $('.failed').length + ' test(s), ' + $('.failed').length + ' failure(s)'
        );
      }
    });

    $('.describe').fn({
      parent: function() {
        return $(this).parent('.describes').parent('.describe');
      },

      enqueue_befores: function() {
//  console.log('enqueue_befores', this);
//        if(!$(Screw).data('enqueued_once_befores')) {
//		  $(Screw).data('enqueued_once_befores', true);
//          $(this).fn('parent').fn('enqueue_once_befores');
//		}
        $(this).fn('parent').fn('enqueue_befores');
        $(this).children('.befores').children('.before').fn('enqueue');
      },

      enqueue_afters: function() {
        $(this).children('.afters').children('.after').fn('enqueue');
        $(this).fn('parent').fn('enqueue_afters');
      },

//      enqueue_once_befores: function() {
//        $(this).children('.once-befores').children('.once-before').fn('enqueue');
//      },
//
//      enqueue_once_afters: function() {
//        $(this).children('.once-afters').children('.once-after').fn('enqueue');
//      },

//      run_befores: function() {
//        $(this).fn('parent').fn('run_befores');
//        $(this).children('.befores').children('.before').fn('run');
//      },
//
//      run_afters: function() {
//        $(this).children('.afters').children('.after').fn('run');
//        $(this).fn('parent').fn('run_afters');
//      },

      enqueue: function() {
        var that = this;
		$(this).children('.once-befores').children('.once-before').fn('enqueue');

        $(this).children('.its').children('.it').fn('enqueue');
        $(this).children('.describes').children('.describe').fn('enqueue');

		$(this).children('.once-afters').children('.once-after').fn('enqueue');
      },
      
      selector: function() {
        return $(this).fn('parent').fn('selector')
          + ' > .describes > .describe:eq(' + $(this).parent('.describes').children('.describe').index(this) + ')';
      }
    });
  
    $('body > .describe').fn({
      selector: function() { return 'body > .describe' }
    });
    
    $('.it').fn({
      parent: function() {
        return $(this).parent('.its').parent('.describe');
      },
      
      run: function() {
        try {
          try {
//            $(this).fn('parent').fn('run_befores');
            $(this).data('screwunit.run')();
          } finally {
//            $(this).fn('parent').fn('run_afters');
          }
          $(this).trigger('passed');
        } catch(e) {
          $(this).trigger('failed', [e]);
        }
      },
      
      enqueue: function() {
        var self = $(this).trigger('enqueued');
        $(this).fn('parent').fn('enqueue_befores');
        $(Screw)
          .queue(function() {
            self.fn('run');
            setTimeout(function() { $(Screw).dequeue() }, 0);
          });
        $(this).fn('parent').fn('enqueue_afters');
      },
      
      selector: function() {
        return $(this).fn('parent').fn('selector')
          + ' > .its > .it:eq(' + $(this).parent('.its').children('.it').index(this) + ')';
      }
    });
    
    $('.before').fn({
      enqueue: function() {
		  var self = $(this).trigger('enqueued');
		  $(Screw)
          .queue(function() {
            self.fn('run');
            setTimeout(function() { $(Screw).dequeue() }, 0);
          });
	  },
      run: function() { $(this).data('screwunit.run')() }
    });

    $('.after').fn({
      enqueue: function() {
		  var self = $(this).trigger('enqueued');
		  $(Screw)
          .queue(function() {
            self.fn('run');
            setTimeout(function() { $(Screw).dequeue() }, 0);
          });
	  },
      run: function() { $(this).data('screwunit.run')() }
    });

    $('.once-before').fn({
      enqueue: function() {
		  var self = $(this);
//          if(!self.data('hasBeenEnqueuedOnce')) {
//            self.data('hasBeenEnqueuedOnce', true);
            self.trigger('enqueued');
            $(Screw)
            .queue(function() {
              self.fn('run');
              setTimeout(function() { $(Screw).dequeue() }, 0);
            });
//		 }
	  },
      run: function() { $(this).data('screwunit.run')() }
    });

    $('.once-after').fn({
      enqueue: function() {
		  var self = $(this);
//          if(!self.data('hasBeenEnqueuedOnce')) {
//            self.data('hasBeenEnqueuedOnce', true);
            self.trigger('enqueued');
            $(Screw)
            .queue(function() {
              self.fn('run');
              setTimeout(function() { $(Screw).dequeue() }, 0);
            });
//		 }
	  },
      run: function() { $(this).data('screwunit.run')() }
    });

    $(Screw).trigger('before');
    var to_run = unescape(location.search.slice(1)) || 'body > .describe > .describes > .describe';
    $(to_run)
      .focus()
      .eq(0).trigger('scroll').end()
      .fn('enqueue');
//	  console.log('enqueued', $('.once-after').not($('.once-after').last()));
    $(Screw).queue(function() { $(Screw).trigger('after') });
  })
})(jQuery);
